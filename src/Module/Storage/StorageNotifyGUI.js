var StorageNotifyGUI = BaseLayer.extend({
    ctor: function() {
        this._super(StorageNotifyGUI.className);

        this.bg = null;
        this.btnNext = null;
        this.btnPrev = null;
        this.btnGo = null;
        this.btnDone = null;

        this.pagination = null;
        this.pageView = null;

        this.initWithBinaryFile("Lobby/StorageNotifyGUI.json");
    },

    initGUI: function() {
        this.bg = this.getControl("bg");
        this.btnNext = this.customButton("btnNext", StorageNotifyGUI.BTN_NEXT, this.bg);
        this.btnNext.defaultPosition = this.btnNext.getPosition();
        this.btnPrev = this.customButton("btnPrev", StorageNotifyGUI.BTN_PREV, this.bg);
        this.btnPrev.defaultPosition = this.btnPrev.getPosition();
        this.btnGo = this.customButton("btnGo", StorageNotifyGUI.BTN_GO, this.bg);
        this.btnDone = this.customButton("btnDone", StorageNotifyGUI.BTN_DONE, this.bg);

        this.pagination = this.getControl("pagination", this.bg);
        this.pageView = this.getControl("pageView", this.bg);
        for (var i = 0; i < this.pagination.getChildrenCount(); i++){
            this.pagination.getChildByName(i).index = i;
            this.pagination.getChildByName(i).addEventListener(function(box, type){
                switch(type){
                    case ccui.CheckBox.EVENT_UNSELECTED:
                        box.setSelected(true);
                        break;
                    case ccui.CheckBox.EVENT_SELECTED:
                        this.pageView.scrollToPage(box.index);
                        this.resetPageViewButtons();
                        break;
                }
            }.bind(this), this);
        }
        this.pageView.addEventListener(function(pageView, type){
            switch(type){
                case ccui.PageView.EVENT_TURNING:
                    this.resetPageViewButtons();
            }
        }.bind(this), this);
        this.pageView.setCustomScrollThreshold(0.2);
        this.enableFog();

        var page = this.pageView.getPage(0);
        page.itemAvatar = this.getControl("itemAvatar", page);
        page.itemVoucher = this.getControl("itemVoucher", page);
        page.title = this.getControl("title", page);

        page = this.pageView.getPage(1);
        page.itemStorage = this.getControl("itemStorage", page);
        page.itemShop = this.getControl("itemShop", page);
        page.title = this.getControl("title", page);

        page = this.pageView.getPage(2);
        page.itemDiamond = this.getControl("itemDiamond", page);
        page.textDiamond = this.getControl("textDiamond", page);
        page.textDiamond.defaultSize = page.textDiamond.getContentSize();
        page.title = this.getControl("title", page);
    },

    onEnterFinish: function() {
        this.pageView.setTouchEnabled(false);
        this.doEffectIn();
        this.runAction(cc.sequence(
            cc.delayTime(0.5),
            cc.callFunc(function(){
                this.pageView.setVisible(true);
                this.doEffectPageIn(0);
            }.bind(this))
        ));
    },

    onButtonRelease: function(button, id) {
        switch(id) {
            case StorageNotifyGUI.BTN_PREV:
                this.pageView.scrollToPage(this.pageView.getCurPageIndex() - 1);
                this.resetPageViewButtons();
                break;
            case StorageNotifyGUI.BTN_NEXT:
                this.pageView.scrollToPage(this.pageView.getCurPageIndex() + 1);
                this.resetPageViewButtons();
                break;
            case StorageNotifyGUI.BTN_GO:
                var delay = this.doEffectPageOut(this.pageView.getCurPageIndex());
                this.runAction(cc.sequence(
                    cc.delayTime(delay),
                    cc.callFunc(function(){
                        this.pageView.setCurPageIndex(this.pageView.getCurPageIndex() + 1);
                        this.doEffectPageIn(this.pageView.getCurPageIndex());
                    }.bind(this))
                ));
                break;
            case StorageNotifyGUI.BTN_DONE:
                this.btnDone.setTouchEnabled(false);
                StorageManager.getInstance().waitDiamondNewItem = true;
                StorageManager.getInstance().sendPopUpNewItem();
                var delay = this.doEffectPageOut(this.pageView.getCurPageIndex());
                this.btnNext.setVisible(false);
                this.btnPrev.setVisible(false);
                this.pagination.setVisible(false);
                this.runAction(cc.sequence(
                    cc.delayTime(delay),
                    cc.callFunc(function(){
                        this.pageView.setVisible(false);
                        this.doEffectOut();
                    }.bind(this)),
                    cc.delayTime(0.75),
                    cc.callFunc(function(){
                        var scene = sceneMgr.getMainLayer();
                        if (scene instanceof LobbyScene) {
                            effectMgr.runLabelPoint(scene._uiDiamond, gamedata.userData.diamond - StorageManager.getInstance().diamondNewItem, gamedata.userData.diamond, 0.5);
                        }
                        popUpManager.removePopUp(PopUpManager.NEW_ITEM);
                    }),
                    cc.removeSelf()
                ));
                break;
        }
    },

    resetAllPositions: function() {
        var page = this.pageView.getPage(0);
        this.resetDefaultPosition(page.itemAvatar);
        this.resetDefaultPosition(page.itemVoucher);
        this.resetDefaultPosition(page.title);
        page.itemAvatar.setOpacity(255);
        page.itemVoucher.setOpacity(255);
        page.title.setScale(1);

        page = this.pageView.getPage(1);
        this.resetDefaultPosition(page.itemStorage);
        this.resetDefaultPosition(page.itemShop);
        this.resetDefaultPosition(page.title);
        page.itemStorage.setOpacity(255);
        page.itemShop.setOpacity(255);
        page.title.setScale(1);

        page = this.pageView.getPage(2);
        this.resetDefaultPosition(page.itemDiamond);
        this.resetDefaultPosition(page.title);
        page.itemDiamond.setOpacity(255);
        page.textDiamond.setContentSize(page.textDiamond.defaultSize);
        page.title.setOpacity(255);
    },
    //effect
    doEffectIn: function() {
        this._fog.setVisible(true);
        this._fog.setOpacity(0);
        this._fog.stopAllActions();
        this._fog.runAction(cc.fadeTo(0.25, 150));

        this.pageView.setVisible(false);
        this.pagination.setVisible(false);
        this.btnPrev.setVisible(false);
        this.btnNext.setVisible(false);
        this.btnGo.setVisible(false);
        this.btnDone.setVisible(false);

        this.bg.setVisible(true);
        this.bg.setScaleX(0);
        this.bg.stopAllActions();
        this.bg.runAction(cc.sequence(
            cc.delayTime(0.25),
            cc.scaleTo(0.5, this._scale, this._scale).easing(cc.easeExponentialOut())
        ));

        this.doEffectButtons();
    },

    doEffectOut: function() {
        this._fog.stopAllActions();
        this._fog.runAction(cc.sequence(
            cc.delayTime(0.5),
            cc.fadeOut(0.25)
        ));

        this.bg.stopAllActions();
        this.bg.runAction(cc.sequence(
            cc.delayTime(0.25),
            cc.scaleTo(0.25, 0, this._scale).easing(cc.easeExponentialIn())
        ));

        this.btnDone.setTouchEnabled(false);
        this.btnDone.stopAllActions();
        this.btnDone.runAction(cc.sequence(
            cc.spawn(
                cc.fadeOut(0.25),
                cc.scaleTo(0.25, 0).easing(cc.easeBackIn())
            ),
            cc.callFunc(function(){
                var scene = sceneMgr.getMainLayer();
                if (scene instanceof LobbyScene) {
                    var btnDiamond = scene.btnDiamond;
                    var pEnd = btnDiamond.convertToWorldSpace(btnDiamond.getChildByName("icon").getPosition());
                    effectMgr.flyItemEffect(
                        sceneMgr.layerGUI,
                        "Lobby/LobbyGUI/iconDiamond.png",
                        100,
                        this.btnDone.convertToWorldSpace(cc.p(this.btnDone.width / 2, this.btnDone.height / 2)),
                        pEnd, 0, true, false
                    );
                }
            }.bind(this))
        ));
    },

    doEffectButtons: function() {
        this.btnNext.stopAllActions();
        this.btnNext.runAction(cc.sequence(
            cc.moveTo(0.4, this.btnNext.defaultPosition.x + 8, this.btnNext.defaultPosition.y).easing(cc.easeSineOut()),
            cc.moveTo(0.4, this.btnNext.defaultPosition)
        ).repeatForever());
        this.btnPrev.stopAllActions();
        this.btnPrev.runAction(cc.sequence(
            cc.moveTo(0.4, this.btnPrev.defaultPosition.x - 8, this.btnPrev.defaultPosition.y).easing(cc.easeSineOut()),
            cc.moveTo(0.4, this.btnPrev.defaultPosition)
        ).repeatForever());
    },

    doEffectPageIn: function(index) {
        var page = this.pageView.getPage(index);
        page.title.setScale(0);
        page.title.setPositionY(page.title.defaultPos.y - 10);
        page.title.stopAllActions();
        page.title.runAction(cc.spawn(
            cc.scaleTo(0.25, 1).easing(cc.easeBackOut()),
            cc.moveTo(0.25, page.title.defaultPos).easing(cc.easeBackOut())
        ));

        var btn = null;
        if (index < this.pageView.getPages().length - 1){
            btn = this.btnGo;
        }
        else{
            btn = this.btnDone;
        }
        btn.setVisible(true);
        btn.setTouchEnabled(false);
        btn.setOpacity(0);
        btn.setPositionY(btn.defaultPos.y - 50);
        btn.stopAllActions();
        btn.runAction(cc.sequence(
            cc.delayTime(1),
            cc.spawn(
                cc.fadeIn(0.5),
                cc.moveTo(0.5, btn.defaultPos).easing(cc.easeBackOut())
            ),
            cc.callFunc(function(){
                btn.setTouchEnabled(true)
            }.bind(this))
        ));
        switch(index){
            case 0:
                page.itemAvatar.setOpacity(0);
                page.itemAvatar.setPositionX(this.pageView.width + page.itemAvatar.width/2);
                page.itemAvatar.stopAllActions();
                page.itemAvatar.getChildByName("text").setOpacity(0);
                page.itemAvatar.runAction(cc.sequence(
                    cc.delayTime(0.25),
                    cc.spawn(
                        cc.fadeIn(0.5),
                        cc.moveTo(0.5, page.itemAvatar.defaultPos).easing(cc.easeQuarticActionOut())
                    ),
                    cc.delayTime(0.25),
                    cc.callFunc(function(){
                        page.itemAvatar.getChildByName("text").runAction(cc.fadeIn(0.5))
                    })
                ));

                page.itemVoucher.setOpacity(0);
                page.itemVoucher.setPositionX(-page.itemVoucher.width/2);
                page.itemVoucher.stopAllActions();
                page.itemVoucher.getChildByName("text").setOpacity(0);
                page.itemVoucher.runAction(cc.sequence(
                    cc.delayTime(0.5),
                    cc.spawn(
                        cc.fadeIn(0.5),
                        cc.moveTo(0.5, page.itemVoucher.defaultPos).easing(cc.easeQuarticActionOut())
                    ),
                    cc.callFunc(function(){
                        page.itemVoucher.getChildByName("text").runAction(cc.fadeIn(0.5))
                    })
                ));
                break;
            case 1:
                page.itemStorage.setOpacity(0);
                page.itemStorage.setPositionX(this.pageView.width + page.itemStorage.width/2);
                page.itemStorage.stopAllActions();
                page.itemStorage.getChildByName("text").setOpacity(0);
                page.itemStorage.runAction(cc.sequence(
                    cc.delayTime(0.25),
                    cc.spawn(
                        cc.fadeIn(0.5),
                        cc.moveTo(0.5, page.itemStorage.defaultPos).easing(cc.easeQuarticActionOut())
                    ),
                    cc.delayTime(0.25),
                    cc.callFunc(function(){
                        page.itemStorage.getChildByName("text").runAction(cc.fadeIn(0.5))
                    })
                ));

                page.itemShop.setOpacity(0);
                page.itemShop.setPositionX(-page.itemShop.width/2);
                page.itemShop.stopAllActions();
                page.itemShop.getChildByName("text").setOpacity(0);
                page.itemShop.runAction(cc.sequence(
                    cc.delayTime(0.5),
                    cc.spawn(
                        cc.fadeIn(0.5),
                        cc.moveTo(0.5, page.itemShop.defaultPos).easing(cc.easeQuarticActionOut())
                    ),
                    cc.callFunc(function(){
                        page.itemShop.getChildByName("text").runAction(cc.fadeIn(0.5))
                    })
                ));
                break;
            case 2:
                page.itemDiamond.setScale(0);
                page.itemDiamond.setOpacity(0);
                page.itemDiamond.setRotation(0);
                page.itemDiamond.stopAllActions();
                page.itemDiamond.runAction(cc.sequence(
                    cc.delayTime(0.25),
                    cc.spawn(
                        cc.scaleTo(0.5, 1).easing(cc.easeBackOut()),
                        cc.fadeIn(0.5),
                        cc.rotateBy(0.5, 360).easing(cc.easeExponentialOut())
                    )
                ));

                page.textDiamond.setContentSize(page.textDiamond.defaultSize.x, 0);
                page.textDiamond.timer = 0;
                page.textDiamond.schedule(function(dt){
                    this.timer += dt;
                    if (this.timer < 0.75) return;
                    if (this.timer >= 1)
                        this.timer = 1;
                    this.setContentSize(this.defaultSize.width, (this.timer-0.75) / 0.25 * this.defaultSize.height);
                    this.getChildByName("text").setPositionY(this.getContentSize().height);

                    if (this.timer == 1)
                        this.unscheduleAllCallbacks();
                }.bind(page.textDiamond));

                this.runAction(cc.sequence(
                    cc.delayTime(1),
                    cc.callFunc(function(){
                        this.resetAllPositions();
                        this.pageView.setTouchEnabled(true);
                        this.pagination.setVisible(true);
                        this.resetPageViewButtons();
                    }.bind(this))
                ));
                break;
        }
    },

    doEffectPageOut: function(index) {
        var page = this.pageView.getPage(index);
        if (this.btnGo.isVisible()) {
            this.btnGo.setTouchEnabled(false);
            this.btnGo.stopAllActions();
            this.btnGo.runAction(cc.sequence(
                cc.spawn(
                    cc.fadeOut(0.5),
                    cc.moveTo(0.5, this.btnGo.defaultPos.x, this.btnGo.defaultPos.y - 50).easing(cc.easeBackIn())
                ),
                cc.callFunc(function () {
                    if (index == this.pageView.getPages().length - 2)
                        this.btnGo.setVisible(false);
                }.bind(this))
            ));
        }
        switch(index){
            case 0:
                page.itemAvatar.stopAllActions();
                page.itemAvatar.runAction(cc.sequence(
                    cc.delayTime(0.5),
                    cc.spawn(
                        cc.fadeOut(0.5),
                        cc.moveTo(0.5, -page.itemAvatar.width/2, page.itemAvatar.defaultPos.y).easing(cc.easeSineOut())
                    )
                ));

                page.itemVoucher.stopAllActions();
                page.itemVoucher.runAction(cc.sequence(
                    cc.delayTime(0.25),
                    cc.spawn(
                        cc.fadeOut(0.5),
                        cc.moveTo(0.5, this.pageView.width + page.itemVoucher.width/2, page.itemVoucher.defaultPos.y).easing(cc.easeSineOut())
                    )
                ));

                page.title.stopAllActions();
                page.title.runAction(cc.sequence(
                    cc.delayTime(0.75),
                    cc.spawn(
                        cc.scaleTo(0.25, 0).easing(cc.easeBackIn()),
                        cc.moveTo(0.25, page.title.defaultPos.x, page.title.defaultPos.y - 10).easing(cc.easeBackIn())
                    )
                ));

                return 1;
                break;
            case 1:
                page.itemStorage.stopAllActions();
                page.itemStorage.runAction(cc.sequence(
                    cc.delayTime(0.5),
                    cc.spawn(
                        cc.fadeOut(0.5),
                        cc.moveTo(0.5, -page.itemStorage.width/2, page.itemStorage.defaultPos.y).easing(cc.easeSineOut())
                    )
                ));

                page.itemShop.stopAllActions();
                page.itemShop.runAction(cc.sequence(
                    cc.delayTime(0.25),
                    cc.spawn(
                        cc.fadeOut(0.5),
                        cc.moveTo(0.5, this.pageView.width + page.itemShop.width/2, page.itemShop.defaultPos.y).easing(cc.easeSineOut())
                    )
                ));

                page.title.stopAllActions();
                page.title.runAction(cc.sequence(
                    cc.delayTime(0.75),
                    cc.spawn(
                        cc.scaleTo(0.25, 0).easing(cc.easeBackIn()),
                        cc.moveTo(0.25, page.title.defaultPos.x, page.title.defaultPos.y - 10).easing(cc.easeBackIn())
                    )
                ));

                return 1;
                break;
            case 2:
                page.itemDiamond.stopAllActions();
                page.itemDiamond.runAction(cc.sequence(
                    cc.delayTime(0.25),
                    cc.spawn(
                        cc.scaleTo(0.5, 0).easing(cc.easeBackIn()),
                        cc.fadeOut(0.5),
                        cc.rotateBy(0.5, -360).easing(cc.easeExponentialIn())
                    )
                ));

                page.textDiamond.timer = 0;
                page.textDiamond.schedule(function(dt){
                    this.timer += dt;
                    if (this.timer >= 0.25)
                        this.timer = 0.25;
                    this.setContentSize(this.defaultSize.width, (0.25 - this.timer) / 0.25 * this.defaultSize.height);
                    this.getChildByName("text").setPositionY(this.getContentSize().height);

                    if (this.timer == 0.25)
                        this.unscheduleAllCallbacks();
                }.bind(page.textDiamond));

                page.title.stopAllActions();
                page.title.runAction(cc.sequence(
                    cc.delayTime(0.75),
                    cc.spawn(
                        cc.scaleTo(0.25, 0).easing(cc.easeBackIn()),
                        cc.moveTo(0.25, page.title.defaultPos.x, page.title.defaultPos.y - 10).easing(cc.easeBackIn())
                    )
                ));

                return 1;
                break;
        }
    },

    resetPageViewButtons: function(){
        this.btnPrev.setVisible(this.pageView.getCurPageIndex() > 0);
        this.btnNext.setVisible(this.pageView.getCurPageIndex() < this.pageView.getPages().length - 1);
        for (var i = 0; i < this.pagination.getChildrenCount(); i++){
            this.pagination.getChildByName(i).setSelected(i == this.pageView.getCurPageIndex());
        }
    }
});
StorageNotifyGUI.className = "StorageNotifyGUI";
StorageNotifyGUI.GUI_TAG = 381;
StorageNotifyGUI.BTN_PREV = 0;
StorageNotifyGUI.BTN_NEXT = 1;
StorageNotifyGUI.BTN_DONE = 2;
StorageNotifyGUI.BTN_GO = 3;