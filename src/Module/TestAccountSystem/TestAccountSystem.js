var TestAccountGUI = BaseLayer.extend({
    ctor: function () {
        this._super();
        this.initWithBinaryFile("TestAccountSystemGUI.json");

        this.isShowPLogin = false;
    },

    initGUI: function () {
        this.bg = this.getControl("bg");

        this.txtGameName = this.getControl("txtGameName", this.bg);

        this.customButton("btnClose", TestAccountGUI.BTN_CLOSE, this.bg);
        this.listRadio = [];
        this.btnFacebook = this.customButton("btnFacebook", TestAccountGUI.BTN_FACEBOOK, this.bg);
        this.listRadio.push(this.getControl("radio", this.btnFacebook));
        this.btnGoogle = this.customButton("btnGoogle", TestAccountGUI.BTN_GOOGLE, this.bg);
        this.listRadio.push(this.getControl("radio", this.btnGoogle));
        this.btnZingme = this.customButton("btnZingme", TestAccountGUI.BTN_ZINGME, this.bg);
        this.listRadio.push(this.getControl("radio", this.btnZingme));

        this.btnIsDev = this.customButton("btnIsDev", TestAccountGUI.BTN_IS_DEV, this.bg);
        this.btnIsDev.radio = this.getControl("radio", this.btnIsDev);

        this.pLoginZingme = this.getControl("pLoginZingme");
        this.pMove = this.getControl("pMove", this.pLoginZingme);
        this.txtUserName = this.getControl("txtUserName", this.pMove);
        this.txtPassword = this.getControl("txtPassword", this.pMove);

        var txtAccessToken = this.getControl("txtAccessToken", this.bg);
        txtAccessToken.setVisible(false);
        this.txtAccessToken = BaseLayer.createEditBox(txtAccessToken);
        this.txtAccessToken.setPosition(txtAccessToken.getPosition());
        this.bg.addChild(this.txtAccessToken);
        this.customButton("btnGetAccessToken", TestAccountGUI.BTN_GET_ACCESS_TOKEN, this.bg);
        this.customButton("btnUserId", TestAccountGUI.BTN_GET_USER_ID, this.bg);

        this.txtResult = this.getControl("txtResult", this.bg);

        this.customButton("btnVipId", TestAccountGUI.BTN_GET_VIP_ID, this.bg);
        this.txtResultVipId = this.getControl("txtResultVipId", this.bg);

        this.listRadioRegis = [];
        this.btnSepHieu = this.customButton("btnHieu", TestAccountGUI.BTN_SEP_HIEU, this.bg);
        this.listRadioRegis.push(this.getControl("radio", this.btnSepHieu));
        this.btnSepKhoa = this.customButton("btnKhoa", TestAccountGUI.BTN_SEP_KHOA, this.bg);
        this.listRadioRegis.push(this.getControl("radio", this.btnSepKhoa));
        this.btnVN = this.customButton("btnVN", TestAccountGUI.BTN_VN, this.bg);
        this.listRadioRegis.push(this.getControl("radio", this.btnVN));
        this.btnGlobal = this.customButton("btnGlobal", TestAccountGUI.BTN_GLOBAL, this.bg);
        this.listRadioRegis.push(this.getControl("radio", this.btnGlobal));

        this.customButton("btnRegis", TestAccountGUI.BTN_REGISTER, this.bg);
    },

    onEnterFinish: function(){
        this.onButtonRelease(null, TestAccountGUI.BTN_ZINGME);
        this.onButtonRelease(null, TestAccountGUI.BTN_SEP_HIEU);
    },

    showHidePLogin: function(isShow){
        if (this.isShowPLogin === isShow){
            return;
        }
        this.pLoginZingme.stopAllActions();
        this.pMove.stopAllActions();
        this.isShowPLogin = isShow;
        var width = this.pLoginZingme.getContentSize().width;
        var actionMove = cc.moveBy(1, width, 0);
        if (isShow){
            this.pMove.setPositionX(this.pMove.defaultPos.x + width);
            this.pLoginZingme.setPositionX(this.pLoginZingme.defaultPos.x - width);
            this.pMove.runAction(actionMove.reverse());
            this.pLoginZingme.runAction(actionMove.clone());
        } else {
            this.pMove.setPositionX(this.pMove.defaultPos.x);
            this.pLoginZingme.setPositionX(this.pLoginZingme.defaultPos.x);
            this.pMove.runAction(actionMove.clone());
            this.pLoginZingme.runAction(actionMove.clone().reverse());
        }
    },

    onButtonRelease: function (btn, id) {
        var gameName = this.txtGameName.getString();
        let isDev = this.btnIsDev.radio.isSelected();
        var username = this.txtUserName.getString();
        var password = this.txtPassword.getString();
        cc.log("gameName: ", gameName);
        switch (id) {
            case TestAccountGUI.BTN_CLOSE:{
                this.onClose();
                break;
            }
            case TestAccountGUI.BTN_FACEBOOK:
            case TestAccountGUI.BTN_GOOGLE:
            case TestAccountGUI.BTN_ZINGME:{
                for (var i = 0; i < this.listRadio.length; i++){
                    this.listRadio[i].setSelected(false);
                }
                this.listRadio[id - TestAccountGUI.BTN_FACEBOOK].setSelected(true);

                this.showHidePLogin(id === TestAccountGUI.BTN_ZINGME);
                this.typeSocial = id;
                break;
            }
            case TestAccountGUI.BTN_GET_ACCESS_TOKEN:{
                this.txtAccessToken.setString("");
                if (gameName === ""){
                    Toast.makeToast(ToastFloat.MEDIUM, "gameName is invalid");
                    break;
                }
                sceneMgr.addLoading();
                if (this.typeSocial === TestAccountGUI.BTN_FACEBOOK || this.typeSocial === TestAccountGUI.BTN_GOOGLE){
                    socialMgr.logout();
                    var frRun = (this.typeSocial === TestAccountGUI.BTN_FACEBOOK) ? fr.facebook : fr.google;
                    frRun.login(function (res,token) {
                        cc.log("TestAccountGUI BTN_GET_ACCESS_TOKEN: ", res, token);
                        var result = (res) ? token : "error " + res;
                        this.txtAccessToken.setString(result);
                        sceneMgr.clearLoading();
                    }.bind(this));
                } else {
                    if (username === "" || password === ""){
                        Toast.makeToast(ToastFloat.MEDIUM, "username or password is invalid");
                        return;
                    }
                    var data = "service_name=zacc_login";
                    data += "&gameId=" + gameName;
                    data += "&username=" + username.toLowerCase();
                    data += "&password=" + md5(password);
                    let linkGetAccess = isDev ? TestAccountGUI.LINK_SERVICE_PRIVATE : TestAccountGUI.LINK_SERVICE_LIVE;
                    cc.log("#Login::" + linkGetAccess + data);
                    this.xhrLoginZingme = LoginHelper.getRequest(linkGetAccess, data, 10000, null, this.onResponse.bind(this, TestAccountGUI.TYPE_GET_ACCESS), this.errorHttp.bind(this, TestAccountGUI.TYPE_GET_ACCESS));
                    engine.HandlerManager.getInstance().addHandler(TestAccountGUI.HANDLER_GET_ACCESS, this.onTimeout.bind(this, TestAccountGUI.TYPE_GET_ACCESS));
                    engine.HandlerManager.getInstance().getHandler(TestAccountGUI.HANDLER_GET_ACCESS).setTimeOut(10, TestAccountGUI.TYPE_GET_ACCESS);
                }

                break;
            }
            case TestAccountGUI.BTN_GET_USER_ID:{
                this.txtResult.setString("");
                if (gameName === ""){
                    Toast.makeToast(ToastFloat.MEDIUM, "gameName is invalid");
                    break;
                }

                var accessToken = this.txtAccessToken.getString();
                if (accessToken === ""){
                    Toast.makeToast(ToastFloat.MEDIUM, "accessToken is invalid");
                    break;
                }
                sceneMgr.addLoading();
                data = TestAccountGUI.POSTFIX_GET_USER_ID + "&gameId=" + gameName;
                data += "&accessToken=" + accessToken;
                var social = "zacc";
                if (this.typeSocial === TestAccountGUI.BTN_FACEBOOK){
                    social = "facebook";
                } else if (this.typeSocial === TestAccountGUI.BTN_GOOGLE){
                    social = "google";
                }
                data += "&social=" + social;

                let linkGetUid = isDev ? TestAccountGUI.LINK_SERVICE_PRIVATE : TestAccountGUI.LINK_SERVICE_LIVE;
                cc.log("#GetUserId::" + linkGetUid + data);
                this.xhrGetUserId = LoginHelper.getRequest(linkGetUid, data, 10000, null, this.onResponse.bind(this, TestAccountGUI.TYPE_GET_UID), this.errorHttp.bind(this, TestAccountGUI.TYPE_GET_UID));

                engine.HandlerManager.getInstance().addHandler(TestAccountGUI.HANDLER_GET_UID, this.onTimeout.bind(this, TestAccountGUI.TYPE_GET_UID));
                engine.HandlerManager.getInstance().getHandler(TestAccountGUI.HANDLER_GET_UID).setTimeOut(10, TestAccountGUI.TYPE_GET_UID);
                break;
            }
            case TestAccountGUI.BTN_IS_DEV:{
                this.btnIsDev.radio.setSelected(!this.btnIsDev.radio.isSelected());
                break;
            }
            case TestAccountGUI.BTN_SEP_HIEU:
            case TestAccountGUI.BTN_SEP_KHOA:
            case TestAccountGUI.BTN_GLOBAL:
            case TestAccountGUI.BTN_VN:{
                let listName = ["boogyi", "dummy", "global_auto", "sam_global"];
                for (var i = 0; i < this.listRadioRegis.length; i++){
                    this.listRadioRegis[i].setSelected(false);
                }
                this.listRadioRegis[id - TestAccountGUI.BTN_SEP_HIEU].setSelected(true);
                this.txtGameName.setString(listName[id - TestAccountGUI.BTN_SEP_HIEU]);

                this.typeRegis = id;
                break;
            }
            case TestAccountGUI.BTN_REGISTER:{
                let linkRegis = !isDev ? TestAccountGUI.LINK_REGIS_HIEU_LIVE : TestAccountGUI.LINK_REGIS_HIEU_DEV;
                let postFix = TestAccountGUI.POSTFIX_REGIS_HIEU_KHOA;
                if (this.typeRegis === TestAccountGUI.BTN_SEP_KHOA){
                    linkRegis = !isDev ? TestAccountGUI.LINK_REGIS_KHOA_LIVE : TestAccountGUI.LINK_REGIS_KHOA_DEV;
                } else if (this.typeRegis === TestAccountGUI.BTN_VN){
                    linkRegis = !isDev ? TestAccountGUI.LINK_REGIS_VN_LIVE : TestAccountGUI.LINK_REGIS_VN_DEV;
                    postFix = TestAccountGUI.POSTFIX_REGIS_VN;
                } else if (this.typeRegis === TestAccountGUI.BTN_GLOBAL){
                    linkRegis = isDev ? TestAccountGUI.LINK_SERVICE_PRIVATE : TestAccountGUI.LINK_SERVICE_LIVE;
                }
                let username = this.txtUserName.getString();
                let password = this.txtPassword.getString();
                if (username === "" || password === ""){
                    Toast.makeToast(ToastFloat.MEDIUM, "username or password is invalid");
                    return;
                }

                postFix = StringUtility.replaceAll(postFix, "xxx", username);
                postFix = StringUtility.replaceAll(postFix, "yyy", md5(password));
                postFix += gameName;
                if (this.typeRegis === TestAccountGUI.BTN_VN){
                    let mac = gameName + username + md5(password);
                    if (gameName === "global_auto"){
                        mac += "SE&fWg6qPgA*c36C";
                    }
                    postFix = StringUtility.replaceAll(postFix, "aaa", md5(mac));
                }
                if (linkRegis.indexOf(".php") >= 0){
                    postFix = "?" + postFix;

                    this.xhrRegis = LoginHelper.registerRequest(linkRegis + postFix, 10000, null,
                        this.onResponse.bind(this, TestAccountGUI.TYPE_REGIS), this.errorHttp.bind(this, TestAccountGUI.TYPE_REGIS));
                } else {
                    this.xhrRegis = LoginHelper.getRequest(linkRegis, postFix, 10000, null,
                        this.onResponse.bind(this, TestAccountGUI.TYPE_REGIS), this.errorHttp.bind(this, TestAccountGUI.TYPE_REGIS));
                }
                cc.log("#Regis::" + linkRegis + postFix);


                engine.HandlerManager.getInstance().addHandler(TestAccountGUI.HANDLER_REGIS, this.onTimeout.bind(this, TestAccountGUI.TYPE_REGIS));
                engine.HandlerManager.getInstance().getHandler(TestAccountGUI.HANDLER_REGIS).setTimeOut(10, TestAccountGUI.TYPE_REGIS);
                break;
            }
            case TestAccountGUI.BTN_GET_VIP_ID:{
                this.txtResultVipId.setString("");
                if (gameName === ""){
                    Toast.makeToast(ToastFloat.MEDIUM, "gameName is invalid");
                    break;
                }

                let userId = this.txtResult.getString();
                if (userId === ""){
                    Toast.makeToast(ToastFloat.MEDIUM, "userId is invalid");
                    break;
                }
                sceneMgr.addLoading();
                data = TestAccountGUI.POSTFIX_GET_VIP_ID;
                let mac = md5(username + userId + 1000 + "^DeEX7KsYZ3-?wY!");
                data = StringUtility.replaceAll(data, "aaa", mac);
                data = StringUtility.replaceAll(data, "xxx", username);
                data = StringUtility.replaceAll(data, "bbb", userId);

                let linkGetUid = isDev ? TestAccountGUI.LINK_SERVICE_PRIVATE : TestAccountGUI.LINK_SERVICE_LIVE;
                cc.log("#GetVipId::" + linkGetUid + data);
                this.xhrGetVipId = LoginHelper.registerRequest(linkGetUid + data, 10000, null, this.onResponse.bind(this, TestAccountGUI.TYPE_GET_VIP_ID), this.errorHttp.bind(this, TestAccountGUI.TYPE_GET_VIP_ID), true);

                engine.HandlerManager.getInstance().addHandler(TestAccountGUI.HANDLER_GET_VIP_ID, this.onTimeout.bind(this, TestAccountGUI.TYPE_GET_VIP_ID));
                engine.HandlerManager.getInstance().getHandler(TestAccountGUI.HANDLER_GET_VIP_ID).setTimeOut(10, TestAccountGUI.TYPE_GET_VIP_ID);
                break;
            }

        }
    },

    onResponse: function(type) {
        cc.log("###onResponse: ", type);
        let mapXhr = [this.xhrLoginZingme, this.xhrGetUserId, this.xhrRegis, this.xhrGetVipId];
        let mapHandler = TestAccountGUI.MAP_HANDLER;
        var xhr = mapXhr[type];
        if(!cc.sys.isNative && (!xhr || (xhr.readyState !== XMLHttpRequest.DONE)))
            return;
        sceneMgr.clearLoading();

        var handler = mapHandler[type];
        engine.HandlerManager.getInstance().forceRemoveHandler(handler);
        var obj = StringUtility.parseJSON(xhr.responseText);
        cc.log("TestAccountGUI handler: ", JSON.stringify(obj));
        if (type === TestAccountGUI.TYPE_GET_ACCESS){
            var data = obj["data"];
            var result = (obj["status"] === 3) ? data["sid"] : "error " + obj["status"];
            cc.log("result: ", result);
            this.txtAccessToken.setString(result);
        } else if (type === TestAccountGUI.TYPE_GET_UID){
            this.txtResult.setString(obj);
        } else if (type === TestAccountGUI.TYPE_GET_VIP_ID){
            this.txtResultVipId.setString(JSON.stringify(obj));
        }  else {
            this.txtAccessToken.setString(JSON.stringify(obj));
        }
    },

    errorHttp: function (type) {
        sceneMgr.clearLoading();
        let mapHandler = TestAccountGUI.MAP_HANDLER;
        var handler = mapHandler[type];
        Toast.makeToast(ToastFloat.MEDIUM, "Error http " + handler);

        engine.HandlerManager.getInstance().forceRemoveHandler(handler);
    },

    onTimeout: function (type) {
        sceneMgr.clearLoading();
        let mapHandler = TestAccountGUI.MAP_HANDLER;
        var handler = mapHandler[type];
        Toast.makeToast(ToastFloat.MEDIUM, "Timeout " + handler);

        engine.HandlerManager.getInstance().forceRemoveHandler(handler);
    }
});

TestAccountGUI.className = "TestAccountGUI";
TestAccountGUI.LINK_SERVICE_LIVE = "https://login-global.zingplay.com/";
TestAccountGUI.LINK_SERVICE_PRIVATE = "http://49.213.70.83:10010/";

TestAccountGUI.POSTFIX_GET_USER_ID = "service_name=getUserId&clientInfo=default&distribution=default";
TestAccountGUI.LINK_GET_USER_ID = "http://login-test.service.zingplay.com:10000?service_name=getUserId&clientInfo=default&distribution=default";
TestAccountGUI.POSTFIX_GET_VIP_ID = "vip/getVipId/xxx/bbb/aaa";

TestAccountGUI.POSTFIX_REGIS_HIEU_KHOA = "service_name=zacc_register&username=xxx&password=yyy&gameId=";
TestAccountGUI.POSTFIX_REGIS_VN = "username=xxx&password=yyy&mac=aaa&v=2&gameid=";

TestAccountGUI.LINK_REGIS_HIEU_LIVE = "https://login.zingplay.com/";
TestAccountGUI.LINK_REGIS_HIEU_DEV = "http://49.213.70.83:10011/";

TestAccountGUI.LINK_REGIS_KHOA_LIVE = "https://sub.zingplay.com/mobile/id.php";
TestAccountGUI.LINK_REGIS_KHOA_DEV = "http://49.213.70.83:10012/";

TestAccountGUI.LINK_REGIS_VN_LIVE = "https://web.service.zingplay.com/sso3/register.php";
TestAccountGUI.LINK_REGIS_VN_DEV = "http://49.213.70.83:10008/register.php";

TestAccountGUI.BTN_CLOSE = 0;
TestAccountGUI.BTN_GET_ACCESS_TOKEN = 1;
TestAccountGUI.BTN_GET_USER_ID = 2;
TestAccountGUI.BTN_FACEBOOK = 3;
TestAccountGUI.BTN_GOOGLE = 4;
TestAccountGUI.BTN_ZINGME = 5;
TestAccountGUI.BTN_IS_DEV = 6;
TestAccountGUI.BTN_SEP_HIEU = 7;
TestAccountGUI.BTN_SEP_KHOA = 8;
TestAccountGUI.BTN_VN = 9;
TestAccountGUI.BTN_GLOBAL = 10;
TestAccountGUI.BTN_REGISTER = 20;
TestAccountGUI.BTN_GET_VIP_ID = 21;

TestAccountGUI.TYPE_GET_ACCESS = 0;
TestAccountGUI.TYPE_GET_UID = 1;
TestAccountGUI.TYPE_REGIS = 2;
TestAccountGUI.TYPE_GET_VIP_ID = 3;

TestAccountGUI.HANDLER_GET_ACCESS = "login_test_zingme";
TestAccountGUI.HANDLER_GET_UID = "get_user_id_test";
TestAccountGUI.HANDLER_REGIS = "test_account_regis";
TestAccountGUI.HANDLER_GET_VIP_ID = "get_vip_id_test";

TestAccountGUI.MAP_HANDLER = [TestAccountGUI.HANDLER_GET_ACCESS, TestAccountGUI.HANDLER_GET_UID, TestAccountGUI.HANDLER_REGIS, TestAccountGUI.HANDLER_GET_VIP_ID];