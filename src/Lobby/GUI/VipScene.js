/**
 * Created by HunterPC on 8/25/2015.
 */

var VipHelpScene = BaseLayer.extend({

    ctor: function () {

        this._currentPage = null;
        this._pageHelp = null;

        this._arrPage= null;
        this._pageInfo = null;

        this.curPage = -1;

        this._super(VipHelpScene.className);
        this.initWithBinaryFile("VipHelpGUI.json");
    },

    initGUI : function() {
        var title = this.getControl("title");
        var bBot = this.getControl("bgBot");
        var bTop = this.getControl("bgTop");
        var bSub = this.getControl("bgSub");

        var bSubSize = cc.director.getWinSize().height - bTop.getContentSize().height*this._scale - bBot.getContentSize().height*this._scale;
        bSub.setScaleY(bSubSize/bSub.getContentSize().height);
        bSub.setPositionY(bTop.getPositionY() - bTop.getContentSize().height*this._scale - bSubSize/2);
        title.setPositionY(bTop.getPositionY() - bTop.getContentSize().height*this._scale/2);

        var btnClose = this.customButton("btnClose",5);
        this.customButton("btnShop",6);
        this.getControl("content");

        this.enableFog();
        this.setBackEnable(true);
    },

    onButtonRelease:function(button,id) {
        if(id == 5)
        {
            this.onBack();
        }
        else if(id == 6)
        {
            if( sceneMgr.getRunningScene().getMainLayer() instanceof ShopIapScene)
                this.onBack();
            else
                gamedata.openShop();
        }
    },

    onBack : function () {
        this.onClose();
    }
});

VipHelpScene.className = "VipHelpScene";
VipHelpScene.GUI_TAG = 500;