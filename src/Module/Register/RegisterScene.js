
var AccountInputUI = BaseLayer.extend({

    ctor: function () {
        // register
        this.xhr = null;                          // HTTP request control

        this._tfName = null;
        this._tfPassword = null;
        this._tfRePassword = null;
        this._tfCmnd = null;

        this.inputDay = 0;
        this.inputMon = 0;
        this.inputYear = 0;

        this.btnDay = null;
        this.btnMon = null;
        this.btnYear = null;
        this.btnCheck = null;
        this.btnAccept = null;

        this.pDay = null;
        this.pMon = null;
        this.pYear = null;

        this.rangeYearOld = 0;

        this._name = "";
        this._pass = "";
        this._repass = "";

        this.savePos = null;
        this.typeGui = AccountInputUI.REGISTER;

        this._super("AccountInputGUI");
        this.initWithBinaryFile("AccountInputGUI.json");
    },

    setParent : function (p) {
        this.loginScene = p;
    },

    initGUI: function () {
        this.setBackEnable(true);
        this.getControl("title");
        this.customButton("btnQuit",LoginScene.BTN_CLOSE_ZME);
        this.pRegister = this.getControl("pRegister");
        this.btnAccept = this.customButton("btnRegister", LoginScene.BTN_REGISTER_ZME, this.pRegister);

        var tfname = this.getControl("tfAcount", this.pRegister);
        tfname.setVisible(false);
        this._tfName = BaseLayer.createEditBox(tfname);
        this._tfName.setInputFlag(1);
        this._tfName.setTag(AccountInputUI.TF_USERNAME);
        this._tfName.setInputMode(cc.EDITBOX_INPUT_MODE_SINGLELINE);
        this._tfName.setDelegate(this);
        this.pRegister.addChild(this._tfName);

        var tfPassword = this.getControl("tfPass", this.pRegister);
        tfPassword.setVisible(false);
        this._tfPassword = BaseLayer.createEditBox(tfPassword);
        this._tfPassword.setTag(AccountInputUI.TF_PASSWORD);
        this._tfPassword.setInputFlag(cc.EDITBOX_INPUT_FLAG_PASSWORD);
        this._tfPassword.setDelegate(this);
        this.pRegister.addChild(this._tfPassword);

        var tfRePassword = this.getControl("tfRepass", this.pRegister);
        tfRePassword.setVisible(false);
        this._tfRePassword = BaseLayer.createEditBox(tfRePassword);
        this._tfRePassword.setTag(AccountInputUI.TF_REPASSWORD);
        this._tfRePassword.setInputFlag(cc.EDITBOX_INPUT_FLAG_PASSWORD);
        this._tfRePassword.setDelegate(this);
        this.pRegister.addChild(this._tfRePassword);

        this.btnDay = this.customButton("btnDay",AccountInputUI.BTN_DAY,this.pRegister);
        this.btnDay.lb = this.getControl("lb",this.btnDay);
        this.btnDay.setPressedActionEnabled(false);
        this.btnMon = this.customButton("btnMon",AccountInputUI.BTN_MON,this.pRegister);
        this.btnMon.lb = this.getControl("lb",this.btnMon);
        this.btnMon.setPressedActionEnabled(false);
        this.btnYear = this.customButton("btnYear",AccountInputUI.BTN_YEAR,this.pRegister);
        this.btnYear.lb = this.getControl("lb",this.btnYear);
        this.btnYear.setPressedActionEnabled(false);

        this.pMon = new PanelDropList(this,PanelDropList.TYPE_MON,this.btnMon);
        this.pMon.setPos(this.btnMon.getPosition());
        this.pMon.setVisible(false);
        this.pRegister.addChild(this.pMon);

        this.pYear = new PanelDropList(this,PanelDropList.TYPE_YEAR,this.btnYear);
        this.pYear.setPos(this.btnYear.getPosition());
        this.pYear.setVisible(false);
        this.pRegister.addChild(this.pYear);

        this.pDay = new PanelDropList(this,PanelDropList.TYPE_DAY,this.btnDay);
        this.pDay.setPos(this.btnDay.getPosition());
        this.pDay.setVisible(false);
        this.pRegister.addChild(this.pDay);

        this.adultPanel = this.getControl("adult",this.pRegister);

        var tfCMND = this.getControl("tfCmnd", this.adultPanel);
        tfCMND.setVisible(false);
        this._tfCmnd = BaseLayer.createEditBox(tfCMND);
        this._tfCmnd.setInputMode(cc.EDITBOX_INPUT_MODE_NUMERIC);
        this._tfCmnd.setDelegate(this);
        this._tfCmnd.setTag(AccountInputUI.TF_CMND);
        this._tfCmnd.setMaxLength(12);
        this.adultPanel.addChild(this._tfCmnd);

        this.btnCheck = this.customButton("btnCheck",AccountInputUI.BTN_CHECK,this.adultPanel);
        this.btnCheck.img = this.getControl("tick",this.adultPanel);
        this.btnCheck.img.setVisible(false);
    },

    editBoxEditingDidBegin: function(editBox) {
        cc.log("DULFDJLKFJ ");
        if (editBox.getTag() == AccountInputUI.TF_USERNAME) {
            Toast.makeToast(Toast.LONG, LocalizedString.to("_LENGTHUSER_"));
        }
        else if (editBox.getTag() == AccountInputUI.TF_PASSWORD) {
            Toast.makeToast(Toast.LONG, LocalizedString.to("REMEMBER_PASSWORD"));
        }
    },

    editBoxReturn : function (editBox) {
        var tag = parseInt(editBox.getTag());
        if(isNaN(tag)) return;

        switch (tag)
        {
            case AccountInputUI.TF_CMND:
            {
                if(!this.checkIdCardValid(this._tfCmnd.getString()))
                {
                    Toast.makeToast(Toast.SHORT,LocalizedString.to("_INPUT_CMND_INVALID_"));
                }
                break;
            }
            case AccountInputUI.TF_USERNAME:
            {

                break;
            }
            case AccountInputUI.TF_PASSWORD:
            {

                break;
            }
            case AccountInputUI.TF_REPASSWORD:
            {
                var repass = this._tfRePassword.getString();
                var pass = this._tfPassword.getString();
                if(repass != pass)
                {
                    Toast.makeToast(Toast.LONG, LocalizedString.to("_CHECKPASSWORD_"));
                }
                break;
            }
        }
    },

    onEnterFinish : function () {
        if(this.savePos == null)
            this.savePos = this.getPosition();
        else
            this.setPosition(this.savePos);

        this._tfName.setString("");
        this._tfPassword.setString("");
        this._tfRePassword.setString("");

        var time = new Date();
        this.btnDay.lb.setString("--");
        this.btnMon.lb.setString("--");
        this.btnYear.lb.setString("----");

        this.inputDay = 0;
        this.inputMon = 0;
        this.inputYear = 0;

        this.adultPanel.setVisible(false);

        this.setPositionY(this.savePos.y - 500);
        this.runAction(cc.moveTo(0.15,this.savePos));
        this.autoSelectDate();
    },

    setTypeGui: function(type) {
        this.typeGui = type;
    },

    onResponseAccessToken: function (social, jdata) {
        // if(!sceneMgr.checkMainLayer(AccountInputUI)) return;

        cc.log("ResponseToken : " + social + "/" + jdata);

        var obj = StringUtility.parseJSON(jdata);

        var error = parseInt(obj["error"]);

        if (error == 0) {
            //  GameData.getInstance().access_token = obj["sessionKey"];
            SocialManager.getInstance().set(this, this.onResponseSessionKey);
        }
        else{
            try{
                if (this.loading && this.loading.getParent())
                    this.loading.removeFromParent(true);
            }
            catch(e)
            {
                cc.log(e);
            }

            sceneMgr.clearLoading();

            switch(error) {
                case 1:
                case 3:
                case 4:
                case 5:
                    //sceneMgr.showOKDialog(LocalizedString.to("_LOGIN_ERROR_" + error));
                    SceneMgr.getInstance().showOkDialogWithAction(localized("_LOGIN_ERROR_" + error), this, this.getSessionKeyMap.bind(this));
                    break;
                case 2:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                case 11:
                {
                    var str = localized("_LOGIN_ERROR_x");
                    str = StringUtility.replaceAll(str,"%error",error);
                    Toast.makeToast(Toast.LONG,str);
                    break;
                }
                case 20:
                {
                    var str = LocalizedString.to("_LOGIN_ERROR_20");
                    var dob = obj["dob"];
                    if (dob === undefined || dob == null) dob = "";
                    str = StringUtility.replaceAll(str, "%birth", dob);
                    // sceneMgr.showOKDialog(str);
                    SceneMgr.getInstance().showOkDialogWithAction(str, this, this.getSessionKeyMap.bind(this));
                    break;
                }
                default :
                    // sceneMgr.showOKDialog(LocalizedString.to("_LOGIN_ERROR_"));
                    SceneMgr.getInstance().showOkDialogWithAction(localized("_LOGIN_ERROR_"), this, this.getSessionKeyMap.bind(this));
                    break;
            }
        }
    },

    onResponseSessionKey: function (social, jdata) {
        // if(!sceneMgr.checkMainLayer(AccountInputUI)) return;

        cc.log("ResponseSession: " + social + "/" + jdata);

        var obj = {};
        try
        {
            obj = JSON.parse(jdata);
        }
        catch(e)
        {
            obj["error"] = 1;
        }

        if (obj["error"] == 0)
        {
            //GameData.getInstance().socialLogined = social;
            //GameData.getInstance().sessionkey = obj["sessionKey"];
            //GameData.getInstance().openID = obj["openId"];
            //
            //GameClient.getInstance().connect();

            // Gui goi tin mapping len Server Socket
            var pk = new CmdSendMapZalo();
            GameData.getInstance().sessionkey = obj["sessionKey"];
            GameData.getInstance().openID = obj["openId"];
            pk.putData(obj["sessionKey"]);
            GameClient.getInstance().sendPacket(pk);
            pk.clean();
        }
        else {
            try{
                if (this.loading && this.loading.getParent())
                    this.loading.removeFromParent(true);
            }
            catch(e)
            {
                cc.log(e);
            }

            // sceneMgr.showOKDialog(LocalizedString.to("_LOGIN_ERROR_"));
            SceneMgr.getInstance().showOkDialogWithAction(localized("_LOGIN_ERROR_"), this, this.getSessionKeyMap.bind(this));
        }
    },

    autoSelectDate : function () {
        this.select(PanelDropList.TYPE_DAY,{name : "1" , value : 1});
        this.select(PanelDropList.TYPE_MON,{name : PanelDropList.getMonthString(1) , value : 1});
        this.select(PanelDropList.TYPE_YEAR,{name : "1990" , value : 1990});
    },

    onButtonRelease: function (button, id) {
        switch (id) {
            case LoginScene.BTN_CLOSE_ZME:
            {
                this.onBack();
                break;
            }
            case LoginScene.BTN_REGISTER_ZME:
            {
                this._name = this._tfName.getString();
                this._pass = this._tfPassword.getString();
                this._repass = this._tfRePassword.getString();

                if (this._name == "" || this._pass == "" || this._repass == "") {
                    Toast.makeToast(Toast.LONG, LocalizedString.to("_CHECKREGISTER_"));
                }
                else if (this._name.length < 6 || this._name.length > 24)
                {
                    Toast.makeToast(Toast.LONG, LocalizedString.to("_LENGTHUSER_"));
                }
                else if (this._pass.length < 6 || this._pass.length > 35)
                {
                    Toast.makeToast(Toast.LONG, LocalizedString.to("_LENGTHPASS_"));
                }
                else if (this._pass != this._repass) {
                    Toast.makeToast(Toast.LONG, LocalizedString.to("_CHECKPASSWORD_"));
                }
                else {
                    if(this.inputDay == 0 || this.inputMon == 0 || this.inputYear == 0)
                    {
                        Toast.makeToast(Toast.LONG, LocalizedString.to("_INPUT_BIRTHDAY_"));
                    }
                    else
                    {
                        var isOk = false;

                        if(this.rangeYearOld == 0)
                        {
                            isOk = true;
                        }
                        else if(this.rangeYearOld == 1)
                        {
                            var cmnd = this._tfCmnd.getString().trim();

                            if(this.checkIdCardValid(cmnd))
                            {
                                isOk = true;
                            }
                            else
                            {
                                Toast.makeToast(Toast.SHORT,LocalizedString.to("_INPUT_CMND_INVALID_"));
                            }
                        }
                        else
                        {
                            var cmnd = this._tfCmnd.getString().trim();
                            var check = this.btnCheck.img.isVisible();
                            if(!this.checkIdCardValid(cmnd))
                            {
                                Toast.makeToast(Toast.LONG, LocalizedString.to("_INPUT_CMND_INVALID_"));
                            }
                            else if(!check)
                            {
                                Toast.makeToast(Toast.LONG, LocalizedString.to("_CHECK_ADULT_"));
                            }
                            else
                            {
                                isOk = true;
                            }
                        }

                        if(isOk)
                        {
                            sceneMgr.addLoading(LocalizedString.to("_REGISTERING_"));

                            var data = "username=" + this._name.toLowerCase();
                            data += "&password=" + md5(this._pass);
                            data += "&gameid=" + LocalizedString.config("GAME");
                            data += "&dob=" + this.getFullBirthday();
                            var mac = md5(LocalizedString.config("GAME") + this._name.toLowerCase() + md5(this._pass) + Config.SECRETKEY);
                            data += "&mac=" + mac;
                            data += "&v=" + 2;
                            var url = Constant.ZINGME_REGISTER_URL + "?" + data;
                            this.xhr = LoginHelper.registerRequest(url, 10000, null, this.onResponseRegister.bind(this), this.errorHttp.bind(this));

                            engine.HandlerManager.getInstance().addHandler("register_zingme", this.onTimeOutRegister.bind(this));
                            engine.HandlerManager.getInstance().getHandler("register_zingme").setTimeOut(10, true);
                        }
                    }
                }
                break;
            }
            case AccountInputUI.BTN_DAY:
            {
                this.pMon.setVisible(false);
                this.pYear.setVisible(false);
                this.pDay.setVisible(!this.pDay.isVisible());

                this.visibleDropList(this.pDay.isVisible());
                break;
            }
            case AccountInputUI.BTN_MON:
            {
                this.pDay.setVisible(false);
                this.pYear.setVisible(false);
                this.pMon.setVisible(!this.pMon.isVisible());

                this.visibleDropList(this.pMon.isVisible());
                break;
            }
            case AccountInputUI.BTN_YEAR:
            {
                this.pDay.setVisible(false);
                this.pMon.setVisible(false);
                this.pYear.setVisible(!this.pYear.isVisible());

                this.visibleDropList(this.pYear.isVisible());
                break;
            }
            case AccountInputUI.BTN_CHECK:
            {
                this.btnCheck.img.setVisible(!this.btnCheck.img.isVisible());
                break;
            }
        }
    },

    visibleDropList : function (visible) {
        this.btnCheck.setTouchEnabled(!visible);
        this._tfCmnd.setTouchEnabled(!visible);
        this._tfName.setTouchEnabled(!visible);
        this._tfPassword.setTouchEnabled(!visible);
        this._tfRePassword.setTouchEnabled(!visible);
        this.btnAccept.setTouchEnabled(!visible);
    },

    calculateRangeYearOld : function () {
        var time = new Date();
        var curYear = parseInt(time.getFullYear());
        var curMonth = parseInt(time.getMonth() + 1);
        var curDay = parseInt(time.getDate());

        var oldYear = parseInt(this.inputYear); if(isNaN(oldYear)) oldYear = curYear - AccountInputUI.RANGE_ADULT_0;
        var oldMon = parseInt(this.inputMon); if(isNaN(oldMon)) oldMon = curYear;
        var oldDay = parseInt(this.inputDay); if(isNaN(oldDay)) oldDay = curYear;

        if(this.checkOverYearOld(curDay,curMonth,curYear,oldDay,oldMon,oldYear,AccountInputUI.RANGE_ADULT_0))
        {
            this.rangeYearOld = 0;

            this.adultPanel.setVisible(false);
        }
        else if (this.checkOverYearOld(curDay,curMonth,curYear,oldDay,oldMon,oldYear,AccountInputUI.RANGE_ADULT_1))
        {
            if(this.rangeYearOld != 1)
            {
                Toast.makeToast(Toast.SHORT,LocalizedString.to("_ADULT_IDCARD_"));
            }
            this.rangeYearOld = 1;

            this.btnCheck.setVisible(false);
            this.adultPanel.setVisible(true);
        }
        else
        {
            if(this.rangeYearOld != 2)
            {
                Toast.makeToast(Toast.SHORT,LocalizedString.to("_ADULT_PROTECT_"));
            }
            this.rangeYearOld = 2;

            this.btnCheck.setVisible(true);
            this.adultPanel.setVisible(true);
        }
    },

    checkOverYearOld : function (d1, m1, y1, d, m, y, range) {

        var deltaY = y1 - y;

        if(deltaY > range)
        {
            return true;
        }
        else if(deltaY < range)
        {
            return false;
        }
        else
        {
            if(m1 < m) return false;
            else if(m1 > m) return true;
            else return (d<=d1);
        }

        return true;
    },

    checkIdCardValid : function (id) {
        if(id === undefined || id == null) id = "";
        id = id.trim();

        return !!(id.length == 9 || id.length == 12);
    },

    select : function (type, info) {
        switch (type)
        {
            case PanelDropList.TYPE_DAY:
            {
                this.btnDay.lb.setString(info.name);
                this.inputDay = info.value;
                break;
            }
            case PanelDropList.TYPE_MON:
            {
                this.btnMon.lb.setString(info.name);
                this.inputMon = info.value;
                break;
            }
            case PanelDropList.TYPE_YEAR:
            {
                this.btnYear.lb.setString(info.name);
                this.inputYear = info.value;
                break;
            }
        }

        this.calculateRangeYearOld();

        this.pDay.setVisible(false);
        this.pMon.setVisible(false);
        this.pYear.setVisible(false);

        this.pDay.updateDay(this.inputMon,this.inputYear);

        if(this.inputDay > PanelDropList.calculateDayOfMonth(this.inputMon,this.inputYear))
        {
            this.inputDay = 1;
            this.btnDay.lb.setString(this.inputDay);
        }

        this.visibleDropList(false);
    },

    getFullBirthday : function () {
        var str = "dd-mm-yyyy";
        str = StringUtility.replaceAll(str,"dd",this.inputDay);
        str = StringUtility.replaceAll(str,"mm",this.inputMon);
        str = StringUtility.replaceAll(str,"yyyy",this.inputYear);
        return str;
    },

    errorHttp: function () {
        engine.HandlerManager.getInstance().forceRemoveHandler("register_zingme");
        this.onResponseRegister("{\"error\": -11}");
    },

    getSessionKeyMap: function() {
        SocialManager.getInstance().set(this, this.onResponseAccessToken.bind(this));
        SocialManager.getInstance().loginZingmeForMapping(this._name, this._pass);
        this.loading = sceneMgr.addLoading(LocalizedString.to("_SINGING_"), true, this);
    },

    onResponseRegister: function (data) {
        sceneMgr.clearLoading();
        if (data) {
            cc.log("ResponseRegister_Fix : " + data);
            var obj = StringUtility.parseJSON(data);

            if (obj["error"] == -11) {
                Toast.makeToast(Toast.LONG, localized("_REGISTERFAIL_"));
            }
            else if (obj["error"] == -10) {
                Toast.makeToast(Toast.LONG, localized("_REGISTERFAIL_"));
            }
        } else {
            cc.log("ResponseRegister_Services : " + this.xhr.responseText);
            var obj = StringUtility.parseJSON(this.xhr.responseText);

            engine.HandlerManager.getInstance().forceRemoveHandler("register_zingme");
            var error = parseInt(obj["error"]);
            switch (error) {
                case 0:
                {
                    if (this.typeGui == AccountInputUI.REGISTER) {
                        cc.sys.localStorage.setItem(LoginScene.USERNAME_KEY, this._name);
                        cc.sys.localStorage.setItem(LoginScene.PASSWORD_KEY, this._pass);
                        this.loginScene.loadUserDefault();

                        this.moveToLogin = function (id) {
                            if (id == Dialog.BTN_OK) {
                                this.onBack();
                            }
                        };
                        SceneMgr.getInstance().showOkDialogWithAction(localized("_REGISTERSUCESSFUL_"), this, this.moveToLogin.bind(this));
                    }
                    else {
                        // thuc hien viec map data zalo sang Zingme, gui len de lay accessToken
                        //  SocialManager.getInstance().set(this, this.onResponseSessionKey.bind(this));
                        this.getSessionKeyMap();
                    }
                    break;
                }
                case 5:
                case -5:
                case 6:
                {
                    Toast.makeToast(Toast.LONG, localized("_REGISTER_ERROR_" + error));
                    break;
                }
                case 2:
                case 7:
                {
                    var str = localized("_LENGTHUSER_");
                    Toast.makeToast(Toast.LONG,str);
                    break;
                }
                case 3:
                case 4:
                case 8:
                case 9:
                {
                    var str = localized("_REGISTER_ERROR_x");
                    str = StringUtility.replaceAll(str,"%error",error);
                    Toast.makeToast(Toast.LONG,str);
                    break;
                }
                default :
                {
                    Toast.makeToast(Toast.LONG, localized("_REGISTER_ERROR_"));
                    break;
                }
            }
        }
    },

    onTimeOutRegister: function () {
        this.xhr.abort();
        this.onResponseRegister("{\"error\": -10}");
    },

    onBack: function () {
        var savePos = this.getPosition();
        savePos.y -= 500;
        this.runAction(cc.sequence(cc.moveTo(0.15,savePos),cc.removeSelf()));
    }
});


AccountInputUI.className = "AccountInputUI";

AccountInputUI.BTN_DAY = 20;
AccountInputUI.BTN_MON = 21;
AccountInputUI.BTN_YEAR = 22;
AccountInputUI.BTN_CHECK = 23;

AccountInputUI.TF_USERNAME = 1;
AccountInputUI.TF_PASSWORD = 2;
AccountInputUI.TF_REPASSWORD = 3;
AccountInputUI.TF_CMND = 4;

AccountInputUI.RANGE_ADULT_0 = 18;
AccountInputUI.RANGE_ADULT_1 = 14;

AccountInputUI.REGISTER = 0;
AccountInputUI.MAP_ACCOUNT = 1;

var ItemDropList = cc.TableViewCell.extend({

    ctor: function (size) {
        this._super();
        this.info = null;

        this.bg = cc.Scale9Sprite.create("LoginGUI/bgDropItem.png");
        var sX = size.width/this.bg.getContentSize().width;
        this.bg.setScaleX(sX);
        this.bg.setScaleY(0.98);

        this.lb = BaseLayer.createLabelText();
        this.lb.setTextVerticalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this.lb.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);

        this.bg.setVisible(true);
        this.addChild(this.bg);
        this.addChild(this.lb);

        this.bg.setPosition(this.bg.getContentSize().width*sX/2,this.bg.getContentSize().height/2);
        this.lb.setPosition(this.bg.getPosition());//X() - this.lb.getContentSize().width/2,this.bg.getPositionY() - this.lb.getContentSize().height/2);
    },

    setInfo : function (info) {
        this.info = info;
        this.lb.setString(info.name);
    },

    getInfo : function () {
        return this.info;
    }

});

var PanelDropList = cc.Node.extend({

    ctor : function (parent,type,btn) {
        this._super();

        this.panel = parent;
        this.dropType = type;
        this.itemData = [];
        this.itemSize = btn.getContentSize();

        switch (this.dropType)
        {
            case PanelDropList.TYPE_DAY:
            {
                this.itemData = PanelDropList.createDay();
                break;
            }
            case PanelDropList.TYPE_MON:
            {
                this.itemData = PanelDropList.createMonth();
                break;
            }
            case PanelDropList.TYPE_YEAR:
            {
                this.itemData = PanelDropList.createYear();
                break;
            }
        }

        this.pList = new cc.TableView(this, cc.size(this.itemSize.width,this.itemSize.height*5));
        this.pList.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.pList.setDelegate(this);
        this.pList.reloadData();
        this.addChild(this.pList);
    },

    setPos : function (pos) {
        this.setPositionX(pos.x - this.itemSize.width/2);
        this.setPositionY(pos.y - this.itemSize.height*5*1.05);
    },

    updateDay : function (mm,yyyy) {
        if(this.dropType != PanelDropList.TYPE_DAY) return;
        if(mm === undefined || yyyy === undefined || mm*yyyy == 0) return;
        var day = PanelDropList.calculateDayOfMonth(mm,yyyy);
        this.itemData = PanelDropList.createDay(day);
        this.pList.reloadData();
    },

    tableCellAtIndex: function (table, idx) {
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new ItemDropList(this.itemSize);
        }
        cell.setInfo(this.itemData[idx]);
        return cell;
    },

    tableCellSizeForIndex: function (table, idx) {
        return this.itemSize;
    },

    numberOfCellsInTableView: function (table) {
        return this.itemData.length;
    },

    tableCellTouched: function (table, cell) {
        this.panel.select(this.dropType,cell.getInfo());
    }
});

PanelDropList.createDay = function (day) {
    if(day === undefined) day = 31;

    var ar = [];
    for(var i = day ; i >= 1 ;i--)
    {
        ar.push({name:i,value:i});
    }
    return ar;
};

PanelDropList.createMonth = function () {
    var ar = [];
    for(var i = 12 ; i >= 1 ;i--)
    {
        ar.push({name:PanelDropList.getMonthString(i),value:i});
    }
    return ar;
};

PanelDropList.createYear = function () {
    var ar = [];

    var curYear = parseInt(new Date().getFullYear());

    for(var i = curYear - 100 ; i < curYear - 2 ;i++)
    {
        ar.push({name:i,value:i});
    }
    return ar;
};

PanelDropList.getMonthString = function (m) {
    var str = LocalizedString.to("REGISTER_MONTH_FIELD");
    return StringUtility.replaceAll(str,"%m",m);
};

PanelDropList.calculateDayOfMonth = function (mm,yyyy) {
    if(mm === undefined || yyyy === undefined) return 31;
    if(mm == 0) yyyy = 1;
    if(yyyy == 0) yyyy = 1900;

    return new Date(yyyy, mm, 0).getDate();
};

PanelDropList.TYPE_DAY = 1;
PanelDropList.TYPE_MON = 2;
PanelDropList.TYPE_YEAR = 3;
