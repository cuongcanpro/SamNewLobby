var PersonalInfoGUI = BaseLayer.extend({
    ctor: function () {
        this._super("PersonalInfoGUI");
        this.initWithBinaryFile("PersonalInfoGUI.json");
    },
    initGUI: function () {
        this.bg = this.getControl("bg");
        this.btnClose = this.customButton("btnClose", PersonalInfoGUI.BTN_CLOSE, this.bg);
        // this.btnClose.setVisible(false);
        this.btnConfirm = this.customButton("btnConfirm", PersonalInfoGUI.BTN_CONFIRM, this.bg);

        this.context = this.getControl("content", this.getControl("icon"));
        this.contextDone = this.getControl("content_done", this.getControl("icon"));

        this.pInfo = this.getControl("pInfo", this.bg);

        this.infoName = this.getControl("bgName", this.pInfo);
        this.txName = this.createExitBox(this.getControl("content", this.infoName), LocalizedString.to("PERSONAL_NAME"), PersonalInfoGUI.TF_NAME);
        this.txName.setMaxLength(100);
        this.infoName.addChild(this.txName);

        this.infoIdentityCard = this.getControl("bgIdentityCard", this.pInfo);
        this.txIdentityCard = this.createExitBox(this.getControl("content", this.infoIdentityCard), LocalizedString.to("PERSONAL_CMND"), PersonalInfoGUI.TF_CMND);
        this.txIdentityCard.setMaxLength(100);
        this.infoIdentityCard.addChild(this.txIdentityCard);

        this.infoEmail = this.getControl("bgEmail", this.pInfo);
        this.txEmail = this.createExitBox(this.getControl("content", this.infoEmail), LocalizedString.to("PERSONAL_EMAIL"), PersonalInfoGUI.TF_EMAIL);
        this.txEmail.setMaxLength(100);
        this.infoEmail.addChild(this.txEmail);

        this.infoPhoneNumber = this.getControl("bgPhoneNumber", this.pInfo);
        this.txPhoneNumber = this.createExitBox(this.getControl("content", this.infoPhoneNumber), LocalizedString.to("PERSONAL_PHONE"), PersonalInfoGUI.TF_PHONE);
        if (cc.sys.isNative){
            this.txPhoneNumber.setInputMode(cc.EDITBOX_INPUT_MODE_NUMERIC);
        }
        this.txPhoneNumber.setMaxLength(100);
        this.infoPhoneNumber.addChild(this.txPhoneNumber);

        this.infoAddress = this.getControl("bgAddress", this.pInfo);
        this.txAddress = this.createExitBox(this.getControl("content", this.infoAddress), LocalizedString.to("PERSONAL_ADDRESS"), PersonalInfoGUI.TF_ADDRESS);
        this.txAddress.setMaxLength(100);
        this.infoAddress.addChild(this.txAddress);
    },

    onEnterFinish: function(){
        this.setFog(true);
        this.setShowHideAnimate();
        this.loadPersonalInfo();
    },

    loadPersonalInfo: function(){
        var personalInfo = cc.sys.localStorage.getItem(PersonalInfoGUI.KEY_SAVE_PERSONAL_INFO + userMgr.getUID());

        var hadInfo = true;
        if (personalInfo && personalInfo !== ""){
            var detail = JSON.parse(personalInfo);

            if (detail["name"] === "" || detail["name"] === "" || detail["name"] === ""
                || detail["name"] === "" || detail["name"] === ""){
                hadInfo = false;
            }
        } else {
            hadInfo = false;
        }

        if (hadInfo){
            cc.log("thong tin ca nhan: " + JSON.stringify(detail));
            this.txName.setString(detail["name"]);
            this.txAddress.setString(detail["address"]);
            this.txIdentityCard.setString(detail["identityCard"]);
            this.txEmail.setString(detail["email"]);
            this.txPhoneNumber.setString(detail["phone"]);
        } else {
            cc.log("chua co thong tin");
            this.txName.setString("");
            this.txAddress.setString("");
            this.txIdentityCard.setString("");
            this.txEmail.setString("");
            this.txPhoneNumber.setString("");
        }

        this.txName.setTouchEnabled(!hadInfo);
        this.txAddress.setTouchEnabled(!hadInfo);
        this.txIdentityCard.setTouchEnabled(!hadInfo);
        this.txEmail.setTouchEnabled(!hadInfo);
        this.txPhoneNumber.setTouchEnabled(!hadInfo);
        this.context.setVisible(!hadInfo);
        this.contextDone.setVisible(hadInfo);

        this.enableConfirmButton(false);
    },

    onButtonRelease: function (btn, id) {
        if (id === PersonalInfoGUI.BTN_CLOSE){
            this.onClose();
            return;
        }

        this.savePersonalInfo();
    },

    savePersonalInfo: function(){
        if ((cc.sys.isNative && !this.txName.isTouchEnabled()) || (!cc.sys.isNative && !this.txName._touchEnabled)){
            this.onClose();
            return;
        }

        var personalInfo = {};
        personalInfo.name = this.txName.getString();
        personalInfo.identityCard = this.txIdentityCard.getString();
        personalInfo.email = this.txEmail.getString();
        personalInfo.phone = this.txPhoneNumber.getString();
        personalInfo.address = this.txAddress.getString();

        cc.sys.localStorage.setItem(PersonalInfoGUI.KEY_SAVE_PERSONAL_INFO + userMgr.getUID(), JSON.stringify(personalInfo));
        this.onClose();
    },

    createExitBox: function (bg, placeHolderString, tag) {
        var edb = new cc.EditBox(bg.getContentSize(), new cc.Scale9Sprite());
        edb.setFont("fonts/tahoma.ttf", 20);
        edb.setPlaceHolder(placeHolderString);
        edb.setPlaceholderFontName("fonts/tahoma.ttf");

        edb.setPlaceholderFontSize(20);
        // edb.setPlaceholderFontColor(cc.color(135, 75, 45));
        edb.setAnchorPoint(cc.p(0, 0.5));
        edb.setPosition(bg.getPosition());
        bg.setVisible(false);
        edb.setDelegate(this);
        edb.setDelegate(this);
        edb.setTag(tag);
        edb.setReturnType(cc.KEYBOARD_RETURNTYPE_DONE);
        if (!cc.sys.isNative){
            edb.setFont("tahoma", 20);
            edb.setPlaceholderFontName("tahoma");
            edb.setAnchorPoint(cc.p(0, 0.6));

            var title = bg.getParent().getChildByName("header");
            if (title){
                title.setAnchorPoint(1, 0.6);
            }
        }
        return edb;
    },

    checkTextInput: function (str, minLen, alert) {
        var ok = true;
        var maxLen = 150;
        if (str === undefined || str == null) {
            ok = false;
        }
        else {
            if (str.length < minLen || str.length > maxLen) {
                ok = false;
            }
        }

        if (!ok && alert) {
            Toast.makeToast(Toast.SHORT, alert);
        }

        ok = true;
        return ok;
    },

    validateEmail: function (email, alert) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var ok = re.test(email);
        if (!ok && alert) {
            Toast.makeToast(Toast.SHORT, alert);
        }
        return ok;
    },

    validateName: function (name, alert) {
        if (!this.checkTextInput(name, 3, alert? LocalizedString.to("PERSONAL_INPUT_NAME") : null)) {
            return false;
        }
        name = name.toLowerCase();
        name = name.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        name = name.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        name = name.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        name = name.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        name = name.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        name = name.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        name = name.replace(/đ/g, "d");
        cc.log("validateName", name);
        var re = /^[a-zA-Z ]{2,}$/g;
        var ok = re.test(name);
        if (!ok && alert) {
            Toast.makeToast(Toast.SHORT, alert);
        }
        return ok;
    },

    editBoxEditingDidEnd: function(editBox){
        cc.log("chay vao day k ta");
        if (!cc.sys.isNative){
            this.editBoxReturn(editBox);
        }
    },

    editBoxReturn: function (editBox) {
        cc.log("editBoxReturn");
        var tag = parseInt(editBox.getTag());
        if (isNaN(tag)) return;

        var str = editBox.getString().trim();
        switch (tag) {
            case PersonalInfoGUI.TF_NAME:
            {
                this.validateName(str, LocalizedString.to("PERSONAL_INPUT_NAME_ERROR"));
                break;
            }
            case PersonalInfoGUI.TF_ADDRESS:
            {
                this.checkTextInput(str, 3, LocalizedString.to("PERSONAL_INPUT_ADDRESS"));
                break;
            }
            case PersonalInfoGUI.TF_PHONE:
            {
                this.checkTextInput(str, 9, LocalizedString.to("PERSONAL_INPUT_PHONE"));
                break;
            }
            case PersonalInfoGUI.TF_CMND:
            {
                this.checkTextInput(str, 9, LocalizedString.to("PERSONAL_INPUT_CMND"));
                break;
            }
            case PersonalInfoGUI.TF_EMAIL:
            {
                this.validateEmail(str, LocalizedString.to("PERSONAL_INPUT_EMAIL"));
                break;
            }
        }

        this.autoCheckRegisterEnable();
    },

    autoCheckRegisterEnable: function () {
        var name = this.txName.getString().trim();
        var address = this.txAddress.getString().trim();
        var cmnd = this.txIdentityCard.getString().trim();
        var sdt = this.txPhoneNumber.getString().trim();
        var email = this.txEmail.getString().trim();

        if (!this.validateName(name) || address.length < 3 || cmnd.length < 9 || sdt.length < 9 || !this.validateEmail(email)) {
            this.enableConfirmButton(false);
            return false;
        }
        this.enableConfirmButton(true);
        return true;
    },

    enableConfirmButton: function (enable) {
        if (enable) {
            this.btnConfirm.setPressedActionEnabled(true);
            this.btnConfirm.setColor(cc.color(255, 255, 255, 255));
            this.btnConfirm.setTouchEnabled(true);
        }
        else {
            this.btnConfirm.setPressedActionEnabled(false);
            this.btnConfirm.setColor(cc.color(92, 92, 92, 255));
            this.btnConfirm.setTouchEnabled(false);
        }
        this.btnConfirm.enable = enable;
    }
});

PersonalInfoGUI.BTN_CLOSE = 1;
PersonalInfoGUI.BTN_CONFIRM = 2;
PersonalInfoGUI.className = "PersonalInfoGUI";

PersonalInfoGUI.TF_NAME = 1;
PersonalInfoGUI.TF_ADDRESS = 2;
PersonalInfoGUI.TF_PHONE = 3;
PersonalInfoGUI.TF_CMND = 4;
PersonalInfoGUI.TF_EMAIL = 5;

PersonalInfoGUI.openGUI = function () {
    cc.log("open Personal info");
    sceneMgr.openGUI(PersonalInfoGUI.className, PopUpManager.INPUT_INFORMATION, PopUpManager.INPUT_INFORMATION);
};

PersonalInfoGUI.checkOpenGuiFirstTime = function(){
    return;
    if (gamedata.userData.winCount + gamedata.userData.lostCount === 0){
        var hasOpened = cc.sys.localStorage.getItem(PersonalInfoGUI.KEY_CHECK_HAS_OPEN_PERSONAL_GUI + gamedata.userData.uID);
        if (hasOpened && hasOpened === "1"){
            cc.log("hasOpen: " + hasOpened);
            return;
        }

        if (popUpManager.canShow(PopUpManager.INPUT_INFORMATION)) {
            PersonalInfoGUI.openGUI();
            cc.sys.localStorage.setItem(PersonalInfoGUI.KEY_CHECK_HAS_OPEN_PERSONAL_GUI + gamedata.userData.uID, "1");
        }
    }
};

PersonalInfoGUI.KEY_SAVE_PERSONAL_INFO = "PersonalInfo_";
PersonalInfoGUI.KEY_CHECK_HAS_OPEN_PERSONAL_GUI = "HasOpenPersonalGUI_";