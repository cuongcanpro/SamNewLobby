/**
 * Created by HunterPC on 8/27/2015.
 */


var TableGiftCodeCell = cc.TableViewCell.extend({

    _parent : null,
    _info : null,
    _txReason : null,

    ctor: function(parent){
        this._super();

        this._parentNode = parent;

        var jsonLayout = ccs.load("GiftCodeCell.json");
        this._layout = jsonLayout.node;
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);


        this.initGUI();
    },

    initGUI : function () {
        var btnUse = ccui.Helper.seekWidgetByName(this._layout,"btnUse");
        btnUse.setPressedActionEnabled(true);
        btnUse.setTag(GiftCodeScene.BTN_USE);
        btnUse.addTouchEventListener(this.onTouchEventHandler,this);
        this._txReason = ccui.Helper.seekWidgetByName(this._layout,"txReason");
        this.gold = ccui.Helper.seekWidgetByName(this._layout,"gold");
        this.gstar = ccui.Helper.seekWidgetByName(this._layout,"gstar");
        this.gold.defaultPos = this.gold.getPosition();
        this.gstar.defaultPos = this.gstar.getPosition();
        this.txtGold = this.gold.getChildByName("txt");
        this.txtGstar = this.gstar.getChildByName("txt");
        this.txtExpire = ccui.Helper.seekWidgetByName(this._layout,"txtExpire");
        this.centerNode = this._layout.getChildByName("centerNode");
    },

    setInfo : function (info) {
        this._info = info ;

        this._txReason.setString(info.desc);
        this.txtGold.setString(StringUtility.formatNumberSymbol(info.gold));
        this.txtGstar.setString(StringUtility.formatNumberSymbol(info.gstar));
        if (info.gold > 0 && info.gstar > 0){
            this.gold.setPositionY(this.gold.defaultPos.y);
            this.gstar.setPositionY(this.gstar.defaultPos.y);
        } else {
            if (info.gold > 0){
                this.gold.setPositionY(this.centerNode.getPositionY());
            } else {
                this.gstar.setPositionY(this.centerNode.getPositionY());
            }
        }
        this.gold.setVisible(info.gold > 0);
        this.gstar.setVisible(info.gstar > 0);

        var expireDate = new Date(parseFloat(info.expire));
        var strTime = expireDate.getHours() + ":" + expireDate.getMinutes();
        var month = expireDate.getMonth() + 1;
        var strDay = expireDate.getDate() + "/" + month + "/" + expireDate.getFullYear();
        var strExpire = localized("GIFTCODE_EXPIRE_TEXT");
        strExpire = StringUtility.replaceAll(strExpire, "@time", strTime);
        strExpire = StringUtility.replaceAll(strExpire, "@day", strDay);
        cc.log("strExpire: ", info.expire, strExpire);
        this.txtExpire.setString(strExpire);
    },

    onTouchEventHandler: function(sender,type){
        if(type == ccui.Widget.TOUCH_ENDED && sender.getTag() == GiftCodeScene.BTN_USE)
        {
            if(this._parentNode != null)
            {
                this._parentNode.onUsingGiftCode2(this._info.giftCode);
            }
        }
    },

    onEnter: function() {
        cc.TableViewCell.prototype.onEnter.call(this);
    }
});

var GiftCodeScene = BaseLayer.extend({

    ctor: function () {
        this._btnGet = null;
        this._btnInput = null;

        this._panelInput = null;
        this._panelGet = null;

        this._lbNotice = null;
        this._txInput = null;

        this._listGift = null;
        this._lG = null;
        this._listCodes = [];

        this._super();
        this.initWithBinaryFile("GiftCodeGUI.json");
    },

    customizeGUI : function () {
        var bg = ccui.Helper.seekWidgetByName(this._layout,"bg");
        this._bg = bg;

        this.customizeButton("btnClose",GiftCodeScene.BTN_CLOSE,bg);
        this.customizeButton("btnInput",GiftCodeScene.BTN_INPUT,bg);
        this.customizeButton("btnGet",GiftCodeScene.BTN_GET,bg);

        this._btnGet = ccui.Helper.seekWidgetByName(bg,"btnGet");
        this._btnInput = ccui.Helper.seekWidgetByName(bg,"btnInput");
        this._btnGet.setPressedActionEnabled(false);
        this._btnInput.setPressedActionEnabled(false);

        this._panelGet = ccui.Helper.seekWidgetByName(bg,"panelGift");
        this._panelInput = ccui.Helper.seekWidgetByName(bg,"panelInput");
        this.customizeButton("btnOK",GiftCodeScene.BTN_OK,this._panelInput);

        this._lG = ccui.Helper.seekWidgetByName(this._panelGet,"listGift");
        this._listGift = new cc.TableView(this,this._lG.getContentSize());
        this._listGift.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this._listGift.setPosition(this._lG.getPosition());
        this._panelGet.addChild(this._listGift);

        var old = ccui.Helper.seekWidgetByName(this._panelInput,"txInput");
        this._txInput = BaseLayer.createEditBox(ccui.Helper.seekWidgetByName(this._panelInput,"txInput"));
        this._panelInput.addChild(this._txInput);
        this._txInput.setPosition(old.getPosition());
        old.setVisible(false);
        this._lbNotice = ccui.Helper.seekWidgetByName(this._panelGet,"lbNotice");

        if (!cc.sys.isNative){
            this._lbNotice.setColor(cc.color(182, 186, 229));
        }

        this.setFog(true);
        this.setBackEnable(true);
    },

    onEnterFinish : function () {
        this.setShowHideAnimate(this._bg,true);
        this.onUpdateGiftCodes([]);
        this.onSwitchTab(GiftCodeScene.TAB_INPUT);
        if (!cc.sys.isNative){
            this._listGift.setTouchEnabled(true);
        }
        this._txInput.setString("");
        var cmd = new CmdSendGetCodeNew();
        GameClient.getInstance().sendPacket(cmd);
    },

    onUpdateGiftCodes : function (datas) {
        this._listCodes = datas;
        this._listGift.reloadData();
        this._lbNotice.setVisible(datas.length <= 0);
        var tab = (datas && datas.length > 0) ? GiftCodeScene.TAB_GET : GiftCodeScene.TAB_INPUT;
        this.onSwitchTab(tab)
    },

    onSwitchTab: function (tab) {
        this._panelGet.setVisible(tab == GiftCodeScene.TAB_GET);
        this._panelInput.setVisible(tab == GiftCodeScene.TAB_INPUT);

        if(tab == GiftCodeScene.TAB_GET)
        {
            this._btnGet.loadTextures("GiftCodeGUI/tabGet.png","GiftCodeGUI/tabGet.png","");
            this._btnInput.loadTextures("GiftCodeGUI/tabInputDisable.png","GiftCodeGUI/tabInputDisable.png","");
        }

        if(tab == GiftCodeScene.TAB_INPUT)
        {
            this._btnGet.loadTextures("GiftCodeGUI/tabGetDisable.png","GiftCodeGUI/tabGetDisable.png","");
            this._btnInput.loadTextures("GiftCodeGUI/tabInput.png","GiftCodeGUI/tabInput.png","");
        }
    },

    onShowGiftCode : function (code) {
        this.onSwitchTab(GiftCodeScene.TAB_INPUT);
        this._txInput.setString(code);
    },

    onUsingGiftCode2: function(code){
        var pk = new CmdSendUseGiftCode();
        pk.putData(code, 1);
        gamedata.inputGiftCode = code;
        GameClient.getInstance().sendPacket(pk);
        this.onClose();
    },

    onUsingGiftCode : function () {
        var code = this._txInput.getString();
        if (code == "")
        {
            Toast.makeToast(Toast.LONG,LocalizedString.to("GIFT_04"));
        }
        else
        {
            if (CheatCenter.checkOpenCheat(code))
                return;

            var pk = new CmdSendUseGiftCode();
            var type = this.isCodeUser(code) ? 1 : 2;
            cc.log("onUsingGiftCode: ", this.isCodeUser(code), type);
            gamedata.inputGiftCode = code;
            pk.putData(code, type);
            GameClient.getInstance().sendPacket(pk);
        }
    },

    tableCellAtIndex:function (table, idx) {
        var cell = table.dequeueCell();
        if(!cell)
        {
            cell = new TableGiftCodeCell(this);
        }
        cell.setInfo(this._listCodes[idx]);
        return cell;
    },

    tableCellSizeForIndex:function(table, idx){
        return cc.size(GiftCodeScene.GIFT_W,GiftCodeScene.GIFT_H);
    },

    numberOfCellsInTableView:function (table) {
        return this._listCodes.length;
    },

    onButtonRelease : function (button, id) {
        switch (id)
        {
            case GiftCodeScene.BTN_GET:
            case GiftCodeScene.BTN_INPUT:
                this.onSwitchTab(id-1);
                break;
            case GiftCodeScene.BTN_OK:
                this.onUsingGiftCode();
                break;
            case GiftCodeScene.BTN_CLOSE:
                this.onBack();
                break;
        }
    },

    isCodeUser: function(code){
        var isCodeUser = false;

        for (var i = 0; i < this._listCodes.length; i++){
            if (this._listCodes[i].giftCode === code){
                isCodeUser = true;
            }
        }

        return isCodeUser;
    },

    onBack : function () {
        this.onClose();
    }
});

GiftCodeScene.className = "GiftCodeScene";

GiftCodeScene.BTN_CLOSE = 0;
GiftCodeScene.BTN_INPUT = 1;
GiftCodeScene.BTN_GET   = 2;
GiftCodeScene.BTN_OK    = 3;
GiftCodeScene.BTN_USE   = 4;

GiftCodeScene.GIFT_W    = 465;
GiftCodeScene.GIFT_H    = 92;

GiftCodeScene.TAB_INPUT     = 0;
GiftCodeScene.TAB_GET       = 1;

GiftCodeScene.list_code = [];

GiftCodeScene.showResultUseGiftCode = function (data){
    var receivedGiftCode = new CmdReceivedUseGiftCode(data);
    var string;
    cc.log("receivedGiftCode: ", JSON.stringify(receivedGiftCode));
    switch (receivedGiftCode.error) {
        case 0:
            var value = JSON.parse(receivedGiftCode.result).value;
            cc.log("value: ", JSON.stringify(value));
            var gold = parseFloat(value.gold);
            var gstar = parseFloat(value.gstar);
            if (gold > 0 && gstar > 0) {
                string = LocalizedString.to("GIFTCODE_USE_SUCCESS_ALL");
            } else {
                if (gold > 0){
                    string = LocalizedString.to("GIFTCODE_USE_SUCCESS_GOLD");
                } else {
                    string = LocalizedString.to("GIFTCODE_USE_SUCCESS_GSTAR");
                }
            }
            string = StringUtility.replaceAll(string, "%gold", StringUtility.pointNumber(gold));
            string = StringUtility.replaceAll(string, "%gstar", StringUtility.pointNumber(gstar));
            break;
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 9:{
            string = LocalizedString.to("GIFTCODE_USE_ERROR_SYSTEM");
            string = StringUtility.replaceAll(string, "@number", receivedGiftCode.error);
            break;
        }
        case 6:{
            string = LocalizedString.to("GIFTCODE_INVALID_CODE_ENTERED");
            break;
        }
        case 7:
        case 8:{
            string = LocalizedString.to("GIFTCODE_NOT_EXIST");
            break;
        }
        case 10:{
            string = LocalizedString.to("GIFTCODE_EXPIRED");
            break;
        }
        case 11:{
            string = LocalizedString.to("GIFTCODE_USED");
            break;
        }
        case 12:{
            string = LocalizedString.to("GIFTCODE_TOTAL_USE_TIME_EXCEEDED");
            break;
        }
        case 13:{
            string = LocalizedString.to("GIFTCODE_USE_TIME_PER_DEVICE_EXCEEDED");
            break;
        }

        default :
            string = (LocalizedString.to("GIFT_CODE_FAIL"));
            break;
    }
    string = StringUtility.replaceAll(string, "%giftcode", gamedata.inputGiftCode);
    if (Config.ENABLE_NEW_VIP){
        sceneMgr.showOkDialogWithAction(string, null, function () {
            var vipLevel = NewVipManager.getInstance().getVipLevel();
            var newLevel = NewVipManager.getInstance().getRealVipLevel();
            if (newLevel > vipLevel){
                NewVipManager.showUpLevelVip(vipLevel, newLevel);
            }
            NewVipManager.getInstance().setWaiting(false);
            sceneMgr.updateCurrentGUI();
        });
        if (receivedGiftCode.error === 0){
            NewVipManager.getInstance().setWaiting(true);
            var gui = sceneMgr.getGUI(LobbyScene.GUI_GIFT_CODE);
            if (gui instanceof GiftCodeScene){
                gui.onClose();
            }
        }
    } else {
        sceneMgr.showOKDialog(string);
    }
    receivedGiftCode.clean();
};
