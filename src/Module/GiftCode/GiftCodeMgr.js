var GiftCodeMgr = BaseMgr.extend({
    ctor: function () {
        this._super();
    },

    onReceived: function (cmd, pk) {
        switch (cmd) {

            case CMD.CMD_GET_GIFT_CODE_SUCCESS: {
                var cggcs = new CmdReceiveGiftCode(p);
                switch (cggcs.res) {
                    case 0:
                        sceneMgr.showOKDialog(LocalizedString.to("GIFT_CODE_FAIL"));
                        break;
                    case 1:
                        var s = LocalizedString.to("GIFT_CODE_SUCCESS");
                        s = StringUtility.replaceAll(s, "%gold", cggcs.money);
                        sceneMgr.showOKDialog(s);
                        break;
                    default :
                        sceneMgr.showOKDialog(LocalizedString.to("GIFT_CODE_FAIL"));
                        break;
                }
                cggcs.clean();
                break;
            }
            case CMD.CMD_GETCODE: {
                var crc = new CmdReceiveCode(p);
                var data = (crc.getError() == 0) ? crc.listCodes : [];
                var gui = sceneMgr.getRunningScene().getMainLayer();
                if (gui instanceof LobbyScene)
                    gui.updateGiftCodes(data);

                crc.clean();
                break;
            }
            case CMD.CMD_GET_LIST_CODE_NEW: {
                var cglcn = new CmdReceiveListCodeNew(p);
                cc.log("CMD_GET_LIST_CODE_NEW: ", JSON.stringify(cglcn));
                var data = (cglcn.getError() == 0) ? cglcn.listCodes : [];
                var gui = sceneMgr.getRunningScene().getMainLayer();
                GiftCodeScene.list_code = data;
                if (gui instanceof LobbyScene)
                    gui.updateGiftCodes(data);

                cglcn.clean();
                break;
            }
            case CMD.CMD_USE_CODE: {
                GiftCodeScene.showResultUseGiftCode(p);
                break;
            }
        }
        return false;
    },

    openLobbyScene: function () {
        var lobby = sceneMgr.openScene(LobbyScene.className);
    }
})

GiftCodeMgr.instance = null;
GiftCodeMgr.getInstance = function () {
    if (!GiftCodeMgr.instance) {
        GiftCodeMgr.instance = new GiftCodeMgr();
    }
    return GiftCodeMgr.instance;
};
var giftCodeMgr = GiftCodeMgr.getInstance();