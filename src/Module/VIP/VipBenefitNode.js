var VipBenefitNode = BaseLayer.extend({
    ctor: function () {
        this._super();
        this.initWithBinaryFile("VipBenefitNode.json");
        this.maxCell = VipBenefitNode.MAX_CELL + (cc.winSize.width > Constant.WIDTH?
            Math.floor((cc.winSize.width - Constant.WIDTH) / 100) : Math.ceil((cc.winSize.width - Constant.WIDTH) / 100));
    },

    initGUI: function () {
        this.bg = this.getControl("bgBenefit");
        this.bg.scroll = this.getControl("scroll", this.bg);
        this.bg.scroll.setScrollBarEnabled(false);
        this.bgTime = this.getControl("bgBenefitTime");
        this.bgTime.scroll = this.getControl("scroll", this.bgTime);
        this.bgTime.scroll.setScrollBarEnabled(false);
        this.lbTime = this.getControl("lbTimeRemain", this.bgTime);

        this.list = [];
        this.listTime = [];

        this.num = 0;
        this.numTime = 0;
    },

    updatePosition: function (effectTime) {
        this.stopAllActions();
        var widthTime = Math.min(this.numTime, this.maxCell + 0.5) * (VipBenefitCell.WIDTH + VipBenefitNode.MARGIN_CELL);
        var width = Math.min(this.num, this.maxCell + 0.5) * (VipBenefitCell.WIDTH + VipBenefitNode.MARGIN_CELL);

        var delta = (widthTime - width) * 0.5;
        if (this.numTime * this.num === 0) {
            if (this.numTime !== 0) delta -= (this.bgTime.x - VipBenefitNode.MARGIN_CELL * 0.5);
            else if (this.num !== 0) delta -= (this.bg.x + VipBenefitNode.MARGIN_CELL * 0.5);
        }
        cc.log("updatePosition:", this.numTime, this.num, delta, this.bgTime.width, this.bgTime.x);
        this.runAction(
            cc.moveTo(effectTime, cc.p(delta, this.y)).easing(cc.easeOut(2))
        );
    },

    changeBenefit: function (num, isTime, isEffect) {
        var scaleTime = 0.1;
        var bg = isTime? this.bgTime : this.bg;
        var thisNum = isTime? this.numTime : this.num;

        bg.stopAllActions();
        var realTargetWidth = VipBenefitCell.WIDTH * num
            + VipBenefitNode.MARGIN_CELL * (num - 1)
            + VipBenefitNode.MARGIN_SIDE * 2;
        bg.scroll.innerWidth = realTargetWidth;
        var targetWidth = VipBenefitCell.WIDTH * Math.min(num, this.maxCell + 0.5)
            + VipBenefitNode.MARGIN_CELL * (Math.min(num, this.maxCell) - 1)
            + VipBenefitNode.MARGIN_SIDE * 2;
        bg.scroll.setBounceEnabled(targetWidth !== realTargetWidth);
        if (num <= 0) targetWidth = 0;
        var delta = targetWidth - bg.width;
        var benefitTime = scaleTime * Math.abs(num - thisNum);
        var times = 25 * Math.abs(num - thisNum) + 1;
        if (isEffect) {
            bg.runAction(cc.sequence(
                cc.sequence(
                    cc.callFunc(function () {
                        bg.width += delta / times;
                        bg.scroll.width = bg.width;
                        bg.scroll.x = bg.scroll.getAnchorPoint().x * bg.width;
                    }.bind(this)),
                    cc.delayTime(benefitTime / times)
                ).repeat(times),
                cc.callFunc(function () {
                    bg.width = targetWidth;
                    bg.scroll.width = bg.width;
                    bg.scroll.x = bg.scroll.getAnchorPoint().x * bg.width;
                }.bind(this))
            ));
        } else {
            bg.width = targetWidth;
            bg.scroll.width = bg.width;
            bg.scroll.x = bg.scroll.getAnchorPoint().x * bg.width;
        }

        var list = isTime? this.listTime : this.list;
        for (var i = 0; i < Math.max(list.length, num); i++) {
            var cell;
            if (i >= list.length) {
                cell = new VipBenefitCell(this);
                bg.scroll.addChild(cell);
                list.push(cell);
            } else {
                cell = list[i];
            }

            cell.setPosition(cc.p(
                bg.scroll.getAnchorPoint().x * targetWidth
                + (isTime? -1 : 1) * (
                    VipBenefitNode.MARGIN_SIDE
                    + (i + 0.5) * VipBenefitCell.WIDTH
                    + i * VipBenefitNode.MARGIN_CELL
                ),
                bg.height / 2
            ));
            if (isTime) cc.log("CELL BENEFIT POSITION", i, bg.width, JSON.stringify(cell.getPosition()));

            if (thisNum < num) {
                if (thisNum <= i && i < num && isEffect) {
                    cell.effectShow(thisNum, scaleTime, i);
                } else {
                    cell.show(i < num);
                }
            } else if (num < thisNum) {
                if (num <= i && i < thisNum && isEffect) {
                    cell.effectHide(thisNum, scaleTime, i);
                } else {
                    cell.show(i < num);
                }
            }
        }

        if (isTime) {
            this.numTime = num;
        } else {
            this.num = num;
        }
    },

    setBenefit: function (level, notEffect) {
        var listBenefit = vipMgr.getListBenefit(level);
        cc.log("THE BENEFIT", JSON.stringify(listBenefit));
        listBenefit.sort(function (a, b) {
            return VipManager.BENEFIT_ORDER[parseInt(a["index"])] - VipManager.BENEFIT_ORDER[parseInt(b["index"])];
        });
        cc.log("THE BENEFIT", JSON.stringify(listBenefit));
        var num = 0;
        var numTime = 0;
        for (var i = 0; i < listBenefit.length; i++) {
            listBenefit[i].isTime = vipMgr.getIsLock(listBenefit[i]["index"]);
            if (listBenefit[i].isTime) {
                listBenefit[i].num = numTime;
                numTime++;
            } else {
                listBenefit[i].num = num;
                num++;
            }
        }
        this.changeBenefit(numTime, true, !notEffect);
        this.changeBenefit(num, false, !notEffect);
        var pNode = this.lbTime.getParent();
        pNode.stopAllActions();
        if (level === vipMgr.getVipLevel()) {
            pNode.runAction(cc.scaleTo(0.2, 1, 1).easing(cc.easeBackOut()));
        } else {
            pNode.runAction(cc.scaleTo(0.2, 1, 0).easing(cc.easeBackIn()));
        }

        for (var i = 0; i < listBenefit.length; i++) {
            if (listBenefit[i].isTime) {
                this.listTime[listBenefit[i].num].setInfo(listBenefit[i], true, level);
            } else {
                this.list[listBenefit[i].num].setInfo(listBenefit[i], false, level);
            }
        }
    },

    turnOnOffTime: function (isOn) {
        this.lbTime.getParent().setVisible(isOn);
    },

    turnOffReceivedStamp: function () {
        for (var i = 0; i < this.list.length; i ++) {
            this.list[i].receivedStamp.setVisible(false);
        }
    },

    runEffectReceive: function () {
        var delay = 0;
        for (var i = 0; i < this.list.length; i ++) {
            if (vipMgr.getIsOneTimeReceived(this.list[i].index)) {
                this.list[i].effectReceive(delay);
                delay += 0.25;
            }
        }
    },

    closeOtherExplain: function (theOpening) {
        for (var i = 0; i < this.list.length; i ++)
            if (this.list[i] !== theOpening) this.list[i].closeExplain();
        for (var i = 0; i < this.listTime.length; i ++)
            if (this.listTime[i] !== theOpening) this.listTime[i].closeExplain();
    },

    update: function (dt) {
        var remainTime = VipManager.getInstance().getRemainTime();
        this.lbTime.setString(VipManager.getRemainTimeString(remainTime));
        var color = remainTime > 0 ? cc.color("#792EB2") : cc.color("#E4C9F4");
        this.lbTime.setColor(color);
    },
});
VipBenefitNode.MARGIN_SIDE = 12;
VipBenefitNode.MARGIN_CELL = 12;
VipBenefitNode.MAX_CELL = 4;

var VipBenefitCell = BaseLayer.extend({
    ctor: function (benefitNode) {
        this.level = 0;
        this.index = 0;
        this.dataValue = 0;
        this.closedAngle = -45;
        this.delayTime = 15;
        this.benefitNode = benefitNode;

        this._super();
        this.initWithBinaryFile("VipBenefitCell.json");
    },

    initGUI: function () {
        this.main = this.getControl("main");

        this.title = this.getControl("title", this.main);
        this.iconTime = this.getControl("iconTime", this.main);

        this.bg = this.getControl("bg", this.main);
        this.img = this.getControl("img", this.bg);
        this.img.ignoreContentAdaptWithSize(true);
        this.value = this.getControl("value", this.bg);
        this.maxStamp = this.getControl("max", this.bg);
        this.maxStamp.setVisible(false);
        this.receivedStamp = this.getControl("received", this.bg);
        this.explain = this.getControl("explain", this.bg);
        this.explain.setVisible(false);
        this.explain.setOpacity(0);
        this.explain.setRotation(this.closedAngle);
        this.lbExplain = this.getControl("label", this.explain);

        this.efx = this.getControl("efx", this.main);
        this.efx.img = this.getControl("img", this.efx);
        this.efx.img.ignoreContentAdaptWithSize(true);
        this.efx.value = this.getControl("value", this.efx);
        this.efx.receivedStamp = this.getControl("received", this.efx);

        this.btn = this.customButton("btn", 0);
        this.btn.setSwallowTouches(false);
    },

    setInfo: function (benefit, isTime, level) {
        if (this.index === benefit["index"]) {
            this.efx.loadTexture("res/Lobby/Vip/bgBenefit" + (isTime? "_time.png" : ""));
            this.efx.img.loadTexture(vipMgr.getBenefitImage(this.index));
            this.efx.value.setString(this.value.getString());
            this.efx.value.setColor(this.value.getColor());
            this.efx.receivedStamp.setVisible(this.receivedStamp.isVisible());

            var actionTime = 0.4;
            this.efx.stopAllActions();
            this.efx.setVisible(true);
            this.efx.setScale(1);
            this.bg.stopAllActions();
            this.bg.setOpacity(0);
            if (level > this.level) {
                this.efx.setAnchorPoint(cc.p(0.5, 0));
                this.efx.setPosition(this.efx.defaultPos);
                this.bg.setPosition(cc.p(this.bg.defaultPos.x, this.efx.defaultPos.y + this.bg.height));
            } else {
                this.efx.setAnchorPoint(cc.p(0.5, 1));
                this.efx.setPosition(cc.p(this.efx.defaultPos.x, this.efx.defaultPos.y + this.efx.height));
                this.bg.setPosition(cc.p(this.bg.defaultPos.x, this.efx.defaultPos.y - this.bg.height));
            }
            this.efx.runAction(cc.sequence(
                cc.scaleTo(actionTime, 1, 0).easing(cc.easeOut(2.5)).easing(cc.easeBackOut()),
                cc.hide()
            ));
            this.bg.runAction(cc.spawn(
                cc.fadeIn(actionTime),
                cc.moveTo(actionTime, this.bg.defaultPos).easing(cc.easeOut(2.5)).easing(cc.easeBackOut())
            ));
        } else {
            this.efx.setVisible(false);
            this.bg.setOpacity(255);
        }

        this.main.setOpacity(255);
        this.bg.loadTexture("res/Lobby/Vip/bgBenefit" + (isTime? "_time.png" : ""));

        this.title.setString(vipMgr.getBenefitName(benefit["index"]));
        this.title.setColor(VipBenefitCell.COLOR_TITLE[isTime? "time" : "timeless"]);

        this.value.setString(vipMgr.getValueBenefit(benefit["index"], benefit["value"]));
        this.value.setColor(VipBenefitCell.COLOR_VALUE[isTime? "time" : "timeless"]);

        this.img.loadTexture(vipMgr.getBenefitImage(benefit["index"]));

        this.iconTime.setVisible(isTime);
        this.receivedStamp.setVisible(level <= vipMgr.getVipLevel() && vipMgr.getIsOneTimeReceived(benefit["index"]));

        this.level = level;
        this.index = benefit["index"];
        this.dataValue = benefit["value"];

        this.setExplain(benefit["index"]);
    },

    setExplain: function (type) {
        switch (parseInt(type)) {
            case VipManager.BENEFIT_SPECIAL_EFFECT:
                this.lbExplain.setVisible(false);
                if (!this.special) {
                    this.special = new VipBoardIcon();
                    this.special.setPosition(cc.p(this.explain.width / 2, this.explain.height / 2 + 25));
                    this.explain.addChild(this.special);
                }
                break;
        }
    },

    effectShow: function (thisNum, scaleTime, i) {
        cc.log("effectShow VipBenefitCell", i);
        this.main.stopAllActions();
        this.main.setVisible(true);
        this.main.setScale(0);
        this.main.runAction(cc.sequence(
            cc.delayTime((i - thisNum + 0.5) * scaleTime),
            cc.scaleTo(scaleTime / 2, 1).easing(cc.easeIn(2))
        ));
        this.explain.setVisible(false);
    },

    effectHide: function (thisNum, scaleTime, i) {
        cc.log("effectHide VipBenefitCell", i);
        this.main.stopAllActions();
        this.main.runAction(cc.sequence(
            cc.delayTime((thisNum - i - 1) * scaleTime),
            cc.spawn(
                cc.scaleTo(scaleTime, 0).easing(cc.easeOut(2)),
                cc.fadeOut(scaleTime)
            ),
            cc.hide()
        ));
        this.explain.setVisible(false);
    },

    effectReceive: function (delay = 0) {
        this.receivedStamp.setVisible(true);
        this.receivedStamp.setOpacity(0);
        this.receivedStamp.setScale(1.75);
        this.receivedStamp.setRotation(15);
        this.receivedStamp.runAction(cc.sequence(
            cc.delayTime(delay),
            cc.spawn(
                cc.fadeIn(0.25).easing(cc.easeOut(2.5)),
                cc.scaleTo(0.25, 1).easing(cc.easeIn(5)),
                cc.rotateTo(0.25, 0).easing(cc.easeBackOut())
            )
        ));
    },

    show: function (isShow) {
        this.main.setVisible(isShow);
    },

    openExplain: function () {
        cc.log("OPENING EXPLAIN");
        var effectTime = 0.15;
        var delayTime = this.delayTime;
        this.explain.stopAllActions();
        this.explain.runAction(cc.sequence(
            cc.show(),
            cc.spawn(
                cc.fadeIn(effectTime),
                cc.rotateTo(effectTime, 0).easing(cc.easeBackOut())
            ),
            cc.delayTime(delayTime),
            cc.callFunc(this.closeExplain.bind(this))
        ));

        if (this.special && this.special.open) {
            this.special.open();
        }
    },

    closeExplain: function () {
        var effectTime = 0.15;
        this.explain.stopAllActions();
        this.explain.runAction(cc.sequence(
            cc.spawn(
                cc.fadeOut(effectTime),
                cc.rotateTo(effectTime, this.closedAngle)
            ),
            cc.hide()
        ));

        if (this.special && this.special.close) {
            this.special.close();
        }
    },

    onButtonRelease: function () {
        return;
        cc.log("INDEX", this.index);
        switch (parseInt(this.index)) {
            case VipManager.BENEFIT_BONUS_SHOP:
                paymentMgr.openShop();
                break;
            case VipManager.BENEFIT_GOLD_SUPPORT:
                sceneMgr.openGUI(GUISupportInfo.className, GUISupportInfo.tag, GUISupportInfo.tag, false).showGUI(0, supportMgr.numSupport);
                break;
            case VipManager.BENEFIT_BONUS_SPIN:
                break;
            default:
                this.openExplain();
                this.benefitNode.closeOtherExplain(this);
                break;
        }
    }
});
VipBenefitCell.WIDTH = 136;
VipBenefitCell.HEIGHT = 196;
VipBenefitCell.COLOR_TITLE = {
    time: cc.color("#c98ceb"),
    timeless: cc.color("#a1b2f0")
};
VipBenefitCell.COLOR_VALUE = {
    time: cc.color("#750aa7"),
    timeless: cc.color("#303d97")
};

var VipBoardIcon = BaseLayer.extend({
    ctor: function (level) {
        this.level = level;
        this.timeScale = 1;

        this._super();
        this.initWithBinaryFile("VipBoardIcon.json");
    },

    initGUI: function () {
        this.gem = this.getControl("gem");
        this.gem.ignoreContentAdaptWithSize(true);
        this.mask = this.getControl("mask", this.gem);
        this.mask.ignoreContentAdaptWithSize(true);

        this.effect = db.DBCCFactory.getInstance().buildArmatureNode("Gem");
        this.effect.getAnimation().setTimeScale(this.timeScale);
        this.effect.setLocalZOrder(-1);
        this._layout.addChild(this.effect);
    },

    open: function () {
        this.level = Math.floor(Math.random() * 10) + 1;
        this.level = 8;
        //Prepare texture and other stuff
        this.gem.stopAllActions();
        this.gem.loadTexture(VipManager.getImageUpVip(this.level));
        this.gem.setVisible(true);
        this.gem.setScale(0);

        this.mask.stopAllActions();
        this.mask.loadTexture(VipManager.getImageUpVip(this.level, true));
        this.mask.setOpacity(255);
        this.mask.setPosition(cc.p(this.gem.width / 2, this.gem.height / 2));

        this.effect.stopAllActions();
        this.effect.setVisible(false);
        this.effect.setScale(0);

        //Zoom in and flash
        var timeZoomToOnePlus = 0.25;
        var timeBackToOneMinus = 0.25;
        var timeZoomToOne = 0.5;
        var sequence = cc.sequence(
            cc.scaleTo(timeZoomToOnePlus, 1.25).easing(cc.easeOut(5)),
            cc.scaleTo(timeBackToOneMinus, 0.75).easing(cc.easeIn(5)),
            cc.scaleTo(timeZoomToOne, 1).easing(cc.easeElasticOut())
        );

        this.gem.runAction(sequence.clone());
        this.mask.runAction((
            cc.fadeOut(timeZoomToOnePlus).easing(cc.easeIn(2.5))
        ));

        this.effect.runAction(sequence.clone());
        this.effect.runAction(cc.sequence(
            cc.scaleTo(timeZoomToOnePlus * 0.2, 1.25).easing(cc.easeOut(2.5)),
            cc.callFunc(function () {
                this.effect.gotoAndPlay("lv" + this.level + "_0", -1, -1, 1);
                this.effect.setCompleteListener(function () {
                    this.effect.gotoAndPlay("lv" + this.level + "_1", -1, -1, 0);
                }.bind(this));
            }.bind(this)),
            cc.show()
        ));
    },

    close: function () {
        this.effect.runAction(cc.scaleTo(0.15, 0).easing(cc.easeBackIn()));
    }
});