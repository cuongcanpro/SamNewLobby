var ReceivedGUI = BaseLayer.extend({
    ctor: function () {
        this._super(ReceivedGUI.className);
        this.initWithBinaryFile("ReceivedGUI.json");
    },

    initGUI: function () {
        db.DBCCFactory.getInstance().loadDragonBonesData("res/Lobby/Received/lightBurst/skeleton.xml", "lightBurst");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Lobby/Received/lightBurst/texture.plist", "lightBurst");

        this.bg = this.getControl("bg");

        this.desciption = this.getControl("description", this.bg);

        this.pDecor = this.getControl("pDecor", this.bg);
        this.logo = [];
        for (var i = 0; i < ReceivedGUI.DECO_LOGO; i++) {
            this.logo.push(this.getControl("logo_" + i, this.pDecor));
        }

        this.pTitle = this.getControl("pTitle", this.bg);
        this.pTitle.title = this.getControl("title", this.pTitle);
        this.pTitle.efxTitle = this.getControl("efx", this.pTitle.title);
        this.pLight = this.getControl("pLight", this.pTitle);
        this.bigLight = this.getControl("bigLight", this.pTitle);
        this.pItems = this.getControl("pItems", this.bg);
        cc.log("WHERE IS PITEMS");

        this.lightBurst = db.DBCCFactory.getInstance().buildArmatureNode("lightBurst");
        this.lightBurst.setVisible(false);
        this.lightBurst.setPosition(this.pTitle.getPosition());
        this.bg.addChild(this.lightBurst)

        this.pConfetti = this.getControl("pConfetti", this.bg);

        this.btn = this.customButton("btn", ReceivedGUI.BTN_CLOSE, this.bg);
        this.btnClose = this.customButton("btnClose", ReceivedGUI.BTN_CLOSE);
        this.customButton("btnReset", ReceivedGUI.BTN_RESET, this.bg).setVisible(Config.ENABLE_CHEAT);
        this.enableFog();
        this._fog.setColor(cc.color("#111b28"));
    },

    onEnterFinish: function () {
        this.resetGUI();

        this.setReceivedRewardInfo();
        this.runAnimation();
    },

    resetGUI: function () {
        this.pItems.removeAllChildren();
        this.items = [];
        this.pConfetti.removeAllChildren();
    },

    setReceivedRewardInfo: function () {
        var receivedGUIInfo = receivedMgr.getReceivedGUIInfo();
        if (!receivedGUIInfo) {
            cc.log("ReceivedGUI THERE IS NO INFO");
            return;
        }

        var info = receivedGUIInfo.info;

        this.pItems.innerWidth = info.length * ReceivedCell.SIZE;
        this.pItems.width = Math.min(info.length * ReceivedCell.SIZE, ReceivedCell.SIZE * (ReceivedGUI.MAX_LENGTH + 0.5));
        this.pItems.setScrollBarEnabled(false);
        this.pItems.setBounceEnabled(info.length > ReceivedGUI.MAX_LENGTH);
        for (var i = 0; i < info.length; i++) {
            var item = new ReceivedCell(info[i]);
            item.setPosition(cc.p((i + 0.5) * ReceivedCell.SIZE, this.pItems.height / 2));
            item.setVisible(false);
            this.pItems.addChild(item);
            this.items.push(item);
        }

        var des = receivedGUIInfo.title;
        if (des) {
            this.desciption.setString(des);
            this.desciption.setVisible(true);
        } else {
            this.desciption.setVisible(false);
        }
    },

    runAnimation: function (isOpened) {
        if (!isOpened) this.doBgEffect();
        this.doDecorEffect();
        this.doLightEffect();
        this.doLogoEffect();
        this.doItemEffect();

        this.scheduleUpdate();

        this.btn.setVisible(false);
        this.btnClose.setVisible(false);
        setTimeout(function () {
            this.btnClose.setVisible(true);
            this.btn.stopAllActions();
            this.btn.setVisible(true);
            this.btn.setScale(0);
            this.btn.runAction(cc.sequence(
                cc.scaleTo(0.1, 1).easing(cc.easeBackOut()),
                cc.scaleTo(0.5, 0.9).easing(cc.easeBackIn()),
                cc.scaleTo(0.5, 1).easing(cc.easeBackOut()),
                cc.scaleTo(0.5, 0.9).easing(cc.easeBackIn()),
                cc.scaleTo(0.5, 1).easing(cc.easeBackOut()),
                cc.delayTime(0.25)
            ).repeatForever())
        }.bind(this), (0.25 + 0.15 * Math.min(ReceivedGUI.MAX_LENGTH, this.items.length)) * 1000);
    },

    doItemEffect: function () {
        var delayDelta = 0.15;
        for (var i = 0; i < this.items.length; i++) {
            this.items[i].startEffect(delayDelta * (i + 1));
        }
    },

    doBgEffect: function () {
        this._fog.stopAllActions();
        this._fog.setOpacity(0);
        this._fog.runAction(cc.fadeTo(0.25, 200));

        this.bg.setOpacity(0);
        this.bg.setScale(0.75);
        this.bg.runAction(cc.spawn(
            cc.fadeIn(0.1),
            cc.scaleTo(0.1, 1).easing(cc.easeBackOut())
        ));
    },

    doDecorEffect: function () {
        var fadeTime = 0.75;
        var idleTime = 5;
        this.pDecor.stopAllActions();
        this.pDecor.setOpacity(0);
        this.pDecor.runAction(cc.fadeIn(fadeTime).easing(cc.easeIn(2)));
        for (var i = 0; i < 2; i++) {
            var dia = this.getControl("a" + i, this.pDecor);
            dia.stopAllActions();
            dia.setScale(0);
            dia.setOpacity(0);
            dia.runAction(cc.sequence(
                cc.spawn(
                    cc.fadeIn(fadeTime * 0.5),
                    cc.scaleTo(fadeTime, 1).easing(cc.easeIn(2.5))
                ),
                cc.scaleTo(idleTime, 0.75).easing(cc.easeOut(2.5))
            ));

            var tri = this.getControl("b" + i, this.pDecor);
            tri.stopAllActions();
            tri.setScale(0);
            tri.setOpacity(0);
            tri.runAction(cc.sequence(
                cc.spawn(
                    cc.fadeIn(fadeTime * 0.5),
                    cc.scaleTo(fadeTime, 1).easing(cc.easeIn(2.5))
                ),
                cc.scaleTo(idleTime, 1.25).easing(cc.easeOut(2.5))
            ));

            var wav = this.getControl("c" + i, this.pDecor);
            wav.stopAllActions();
            wav.setOpacity(0);
            wav.setPosition(wav.defaultPos);
            wav.runAction(cc.sequence(
                cc.moveTo(0, cc.p(
                    wav.defaultPos.x + (wav.defaultPos.x > cc.winSize.width * 0.5 ? -80 : 80),
                    wav.defaultPos.y
                )),
                cc.spawn(
                    cc.moveTo(idleTime, wav.defaultPos).easing(cc.easeInOut(2.5)),
                    cc.fadeIn(idleTime * 0.75)
                ),
                cc.fadeOut(fadeTime)
            ).repeatForever());
        }
    },

    doLightEffect: function () {
        var fadeTime = 0.75;
        var idleTime = 5;
        var timeTitle = 0.275;
        this.pLight.setOpacity(255);
        this.pLight.setPosition(this.pLight.defaultPos);
        this.bigLight.setScale(0);
        this.bigLight.setOpacity(255);
        this.pTitle.stopAllActions();
        this.pTitle.setPositionX(cc.winSize.width * 0.85);
        this.pTitle.title.setSkewX(25);
        this.pTitle.efxTitle.setOpacity(255);
        this.pTitle.runAction(cc.sequence(
            cc.moveTo(timeTitle, cc.p(this.pTitle.defaultPos.x - 25, this.pTitle.defaultPos.y)).easing(cc.easeIn(2)),
            cc.callFunc(function () {
                this.pTitle.title.runAction(cc.skewTo(timeTitle, 0, 0).easing(cc.easeBackOut()));
                this.pTitle.efxTitle.runAction(cc.fadeOut(timeTitle * 2).easing(cc.easeIn(2.5)));
                this.pLight.setOpacity(255);
                this.pLight.runAction(cc.spawn(
                    cc.moveTo(timeTitle * 2, cc.p(-cc.winSize.width * 0.5, this.pLight.y)).easing(cc.easeOut(2.5)),
                    cc.fadeOut(timeTitle * 2).easing(cc.easeIn(2.5))
                ));
                this.bigLight.runAction(cc.spawn(
                    cc.fadeOut(timeTitle * 2).easing(cc.easeIn(2.5)),
                    cc.scaleTo(timeTitle * 2, 3.5).easing(cc.easeOut(2.5))
                ));
            }.bind(this)),
            cc.moveTo(timeTitle, this.pTitle.defaultPos).easing(cc.easeOut(5))
        ));
        for (var i = 0; i < 3; i++) {
            var stripe = this.getControl("stripe_" + i, this.pTitle);
            stripe.setPosition(stripe.x - 150, stripe.y);
            stripe.setOpacity(0);
            stripe.runAction(cc.sequence(
                cc.delayTime(0.25),
                cc.spawn(
                    cc.fadeIn(fadeTime),
                    cc.moveTo(fadeTime, stripe.defaultPos).easing(cc.easeOut(5))
                ),
                cc.moveBy(idleTime + idleTime * Math.random() * 0.5, cc.p(150, 0))
            ));
        }
    },

    doLogoEffect: function () {
        var moveTime = 7.5;
        for (var i = 0; i < this.logo.length; i++) {
            var logo = this.logo[i];
            logo.stopAllActions();
            logo.setPosition(logo.defaultPos);
            logo.runAction(cc.sequence(
                cc.moveTo(0, logo.defaultPos),
                cc.moveBy(moveTime, cc.p(this.bg.width * 0.15, 0))
            ).repeatForever());
            if (i === 0) {
                logo.runAction(cc.sequence(
                    cc.fadeOut(0),
                    cc.fadeIn(moveTime)
                ).repeatForever());
            } else if (i === this.logo.length - 1) {
                logo.runAction(cc.sequence(
                    cc.fadeIn(0),
                    cc.fadeOut(moveTime)
                ).repeatForever());
            }
        }
    },

    update: function (dt) {
        if (Math.random() < 0.1) {
            var paper = new Paper();
            paper.setPosition(cc.p(0, this.pConfetti.height));
            this.pConfetti.addChild(paper);
            paper.startEffect();
        }

        if (Math.random() < 0.05) {
            var sparkle = new Sparkle();
            this.pConfetti.addChild(sparkle);
            if (Math.random() < 0.5) {
                sparkle.setPositionY(0);
                sparkle.setRotation(180);
            } else {
                sparkle.setPositionY(this.pConfetti.height);
                sparkle.setRotation(0);
            }
            sparkle.startEffect();
        }
    },

    onButtonRelease: function (btn, id) {
        switch (id) {
            case ReceivedGUI.BTN_CLOSE:

                receivedMgr.removeReceivedGUIInfo();
                if (receivedMgr.isFinishData()) {
                    this.onClose();
                } else {
                    this.resetGUI();
                    this.setReceivedRewardInfo();
                    this.runAnimation(true);
                }
                break;
            case ReceivedGUI.BTN_RESET:
                this.runAnimation(true);
                break;
        }
    },

    onClose: function () {
        this._fog.stopAllActions();
        this._fog.runAction(cc.fadeOut(0.25).easing(cc.easeOut(2.5)));

        this.bg.stopAllActions();
        this.bg.runAction(cc.sequence(
            cc.fadeOut(0.25).easing(cc.easeOut(2.5)),
            cc.callFunc(this.onCloseDone.bind(this))
        ));

        for (var i = 0; i < this.items.length; i++) {
            this.items[i].endEffect();
        }
    },

    onCloseDone: function () {
        dispatcherMgr.dispatchEvent(ReceivedManager.EVENT_CLOSE_GUI);
        let callBack = receivedMgr.getCallbackOnClose();
        callBack();
        this._super();
    },
});
ReceivedGUI.className = "ReceivedGUI";
ReceivedGUI.MAX_LENGTH = 5;
ReceivedGUI.DECO_LOGO = 8;

ReceivedGUI.BTN_CLOSE = 0;
ReceivedGUI.BTN_RESET = 1;

var ReceivedCell = cc.Node.extend({
    ctor: function (info) {
        this._super();

        var jsonLayout = ccs.load("ReceivedCell.json");
        this._layout = jsonLayout.node;
        this._layout.setContentSize(cc.winSize.width, cc.winSize.height);
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this.initGUI();
        this.setInfo(info);
    },

    getControl: function (cName, p) {
        if (!p) p = this._layout;
        var control = ccui.Helper.seekWidgetByName(p, cName);
        if (control == null) control = p.getChildByName(cName);
        if (control == null) {
            cc.log("ERROR : getControl " + cName + "/" + p);
            return null;
        }
        control.defaultPos = control.getPosition();
        return control;
    },

    initGUI: function () {
        this.bg = this.getControl("bg");
        this.bgModify = this.getControl("bgModify");
        this.lbModify = this.getControl("label", this.bgModify);
        this.pItem = this.getControl("pItem");
        this.itemImg = this.getControl("itemImg", this.pItem);
        this.itemImg.defaultPos = this.itemImg.getPosition();
        this.itemImg.ignoreContentAdaptWithSize(true);

        this.flareArr = [];
        for (let i = 0; i < 3; i++) {
            let flare = this.getControl("flare_" + i, this.pItem);
            flare.setLocalZOrder(1);
            this.flareArr.push(flare);
        }

        this.num = this.getControl("num");
        this.pEffect = this.getControl("pEffect");
        this.efxOutline = this.getControl("efxOutline", this.bg);
        this.efxFlash = this.getControl("efxFlash");
        this.efxFlash.img = this.getControl("img", this.efxFlash);
        this.name = this.getControl("name");
    },

    setInfo: function (info) {
        cc.log("RECEIVED CELL", JSON.stringify(info));
        var prefix = "";
        var subfix = "";
        switch (parseInt(info.type)) {
            case ReceivedCell.TYPE_GOLD:
                this.itemImg.loadTexture("res/Lobby/Received/defaultItem/gold.png");
                if (!info.title) info.title = "Vàng";
                break;
            case ReceivedCell.TYPE_G:
                this.itemImg.loadTexture("res/Lobby/Received/defaultItem/g.png");
                if (!info.title) info.title = "G";
                break;
            case ReceivedCell.TYPE_VPOINT:
                this.itemImg.loadTexture("res/Lobby/Received/defaultItem/vPoint.png");
                if (!info.title) info.title = "VPoint";
                break;
            case ReceivedCell.TYPE_VHOUR:
                this.itemImg.loadTexture("res/Lobby/Received/defaultItem/vHour.png");
                if (!info.title) info.title = "Giờ VIP";
                subfix = " giờ";
                break;
            case ReceivedCell.TYPE_DIAMOND:
                this.itemImg.loadTexture("res/Lobby/Received/defaultItem/diamond.png");
                if (!info.title) info.title = "Kim cương";
                break;
            case ReceivedCell.TYPE_OBJ:
                this.itemImg.setVisible(false);
                this.pItem.addChild(info.obj);
                info.obj.setPosition(cc.p(this.pItem.width * 0.5, this.pItem.height * 0.5));
                info.obj.defaultPos = info.obj.getPosition();
                this.itemImg = info.obj;
                prefix = "x";
                break;
            default:
                try {
                    this.itemImg.loadTexture(info.type);
                } catch (e) {
                    this.itemImg.setVisible(false);
                    cc.log("NO TEXTURE ReceivedCell");
                }
                break;
        }

        this.rewardType = info.type;
        this.num.setString(
            prefix
            + (info.number > ReceivedCell.MAX_POINT_NUMBER?
            StringUtility.formatNumberSymbol(info.number) : StringUtility.pointNumber(info.number))
            + subfix
        );

        if (!info.modify) info.modify = "";
        this.lbModify.setString(info.modify);
        this.bgModify.width = StringUtility.getLabelWidth(this.lbModify) + 24;
        this.bgModify.setVisible(info.modify !== "");

        if (!info.title) info.title = "";
        this.name.setString(info.title);
    },

    startEffect: function (delay) {
        this.setVisible(true);

        var firstActTime = 0.25;
        var secondActTime = 0.5;
        var thirdActTime = 0.25;
        var outlineTime = 0.75;
        var flashTime = 0.5;

        this.doEffectBg(delay, firstActTime, secondActTime);
        this.doEffectBgModify(delay, firstActTime, secondActTime, thirdActTime);
        this.doEffectLabel(delay, firstActTime, secondActTime, thirdActTime);
        this.doEffectOutline(delay, firstActTime, outlineTime);
        this.doEffectFlash(delay, flashTime);
        this.doEffectLight(delay, firstActTime, secondActTime);
        this.doEffectFlare(delay, firstActTime, secondActTime);
        this.doEffectItem(delay, firstActTime, secondActTime);

    },

    doEffectItem: function (delay, firstActTime, secondActTime) {
        this.itemImg.setVisible(true);
        this.itemImg.setPosition(cc.p(100, 0));
        this.itemImg.setOpacity(0);
        this.itemImg.setRotation3D(cc.math.vec3(0, 90, 0));
        this.itemImg.runAction(cc.sequence(
            cc.delayTime(delay),
            cc.spawn(
                cc.moveTo(firstActTime, this.itemImg.defaultPos).easing(cc.easeBackOut()),
                cc.sequence(
                    cc.delayTime(firstActTime * 0.5),
                    cc.spawn(
                        cc.fadeIn(0.1),
                        cc.rotateBy(secondActTime * 1.5, cc.math.vec3(0, 270, 0)).easing(cc.easeBackOut())
                    )
                )
            )
        ));
    },

    doEffectBg: function (delay, firstActTime, secondActTime) {
        this.bg.setVisible(true);
        this.bg.setOpacity(0);
        this.bg.setPosition(cc.p(100, 0));
        this.bg.runAction(cc.sequence(
            cc.delayTime(delay),
            cc.spawn(
                cc.moveTo(firstActTime, this.bg.defaultPos).easing(cc.easeBackOut()),
                cc.fadeIn(firstActTime * 0.5),
                cc.sequence(
                    cc.delayTime(firstActTime * 0.5),
                    cc.rotateBy(secondActTime, cc.math.vec3(0, 180, 0)).easing(cc.easeBackOut()),
                    cc.rotateTo(0, cc.math.vec3(0, 0, 0))
                )
            )
        ));
    },

    doEffectBgModify: function (delay, firstActTime, secondActTime, thirdActTime) {
        this.bgModify.setOpacity(0);
        this.bgModify.setScale(0.5);
        this.bgModify.runAction(cc.sequence(
            cc.delayTime(delay + firstActTime + secondActTime),
            cc.spawn(
                cc.fadeIn(0.1),
                cc.scaleTo(thirdActTime, 1).easing(cc.easeBackOut())
            )
        ));
    },

    doEffectLabel: function (delay, firstActTime, secondActTime, thirdActTime) {
        this.num.setOpacity(0);
        this.num.runAction(cc.sequence(
            cc.delayTime(delay + firstActTime + secondActTime),
            cc.fadeIn(thirdActTime)
        ));

        this.name.setOpacity(0);
        this.name.runAction(cc.sequence(
            cc.delayTime(delay),
            cc.fadeIn(thirdActTime)
        ));
    },

    doEffectOutline: function (delay, firstActTime, outlineTime) {
        this.efxOutline.setVisible(true);
        this.efxOutline.setScale(0);
        this.efxOutline.setOpacity(0);
        this.efxOutline.runAction(cc.sequence(
            cc.delayTime(delay + firstActTime * 0.25),
            cc.spawn(
                cc.scaleTo(outlineTime, 1.25).easing(cc.easeOut(2.5)),
                cc.sequence(
                    cc.fadeIn(outlineTime * 0.1),
                    cc.delayTime(outlineTime * 0.25),
                    cc.fadeOut(outlineTime * 0.65)
                )
            )
        ));
    },

    doEffectFlash: function (delay, flashTime) {
        this.efxFlash.setVisible(true);
        var flash = this.efxFlash.img;
        flash.setPositionX(flash.defaultPos.x - flash.width);
        flash.runAction(cc.sequence(
            cc.delayTime(delay),
            cc.moveTo(flashTime, cc.p(
                flash.defaultPos.x + flash.width, flash.defaultPos.y
            )).easing(cc.easeIn(2.5))
        ));
    },

    doEffectLight: function (delay, firstActTime, secondActTime) {
        for (var i = 0; i < 2; i++) {
            var light = this.getControl("light_" + i, this.efxFlash);
            light.setOpacity(255 - i * 100);
            light.runAction(cc.sequence(
                cc.delayTime(delay + firstActTime + secondActTime + i * 0.15),
                cc.callFunc(function () {
                    var light = this;
                    light.runAction(cc.sequence(
                        cc.moveTo(0, light.defaultPos),
                        cc.moveTo(1.5, cc.p(
                            light.defaultPos.x + 165,
                            light.defaultPos.y - 165
                        )).easing(cc.easeIn(2 + Math.random() * 0.5)),
                        cc.delayTime(2)
                    ).repeatForever());
                }.bind(light))
            ));
        }
    },

    doEffectFlare: function (delay, firstActTime, secondActTime) {
        for (var i = 0; i < this.flareArr.length; i++) {
            var f = this.flareArr[i];
            f.setScale(0);
            f.runAction(cc.sequence(
                cc.delayTime(delay + firstActTime + secondActTime),
                cc.callFunc(function () {
                    var time = 0.75 * Math.random() + 0.25;
                    this.runAction(cc.sequence(
                        cc.delayTime(Math.random() + 2),
                        cc.callFunc(function () {
                            var parent = this.getParent();
                            this.setPosition(cc.p(
                                parent.width * 0.5 + 100 * (0.5 - Math.random()),
                                parent.height * 0.5 + 100 * (0.5 - Math.random())
                            ));
                            this.setRotation(Math.random() * 360);
                        }.bind(this)),
                        cc.sequence(
                            cc.scaleTo(0.25, 0.75 + 0.25 * Math.random()),
                            cc.delayTime(time - 0.5),
                            cc.scaleTo(0.25, 0)
                        )
                    ).repeatForever());
                }.bind(f))
            ));
        }
    },

    endEffect: function (delay = 0) {
        var children = this._layout.getChildren();
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            child.stopAllActions();
            child.runAction(cc.sequence(
                cc.delayTime(delay),
                cc.fadeOut(0.15)
            ));
        }
    }
});
ReceivedCell.SIZE = 150;
ReceivedCell.TYPE_GOLD = 0;
ReceivedCell.TYPE_G = 1;
ReceivedCell.TYPE_VPOINT = 2;
ReceivedCell.TYPE_VHOUR = 3;
ReceivedCell.TYPE_DIAMOND = 4;
ReceivedCell.TYPE_OBJ = 5;
ReceivedCell.MAX_POINT_NUMBER = 99999999;

// Localize
ReceivedCell.GOLD_TEXT = "Gold";
ReceivedCell.G_TEXT = "G-Gold";