var VipBenefitNode = BaseLayer.extend({
    ctor: function () {
        this._super();
        this.initWithBinaryFile("VipBenefitNode.json");
    },

    initGUI: function () {
        this.bg = this.getControl("bgBenefit");
        this.bgTime = this.getControl("bgBenefitTime");
        this.lbTime = this.getControl("lbTimeRemain", this.bgTime);

        this.list = [];
        this.listTime = [];

        this.num = 0;
        this.numTime = 0;
    },

    updatePosition: function (effectTime) {
        this.stopAllActions();
        var delta = (this.numTime - this.num) * (VipBenefitCell.WIDTH + VipBenefitNode.MARGIN_CELL) * 0.5;
        this.runAction(
            cc.moveTo(effectTime, cc.p(cc.winSize.width * 0.5 + delta, this.y)).easing(cc.easeOut(2))
        );
    },

    changeBenefit: function (num, isTime) {
        var scaleTime = 0.1;
        var bg = isTime? this.bgTime : this.bg;
        var thisNum = isTime? this.numTime : this.num;

        bg.stopAllActions();
        var targetWidth = VipBenefitCell.WIDTH * num
            + VipBenefitNode.MARGIN_CELL * (num - 1)
            + VipBenefitNode.MARGIN_SIDE * 2;
        if (num <= 0) targetWidth = 0;
        var delta = targetWidth - bg.width;
        var benefitTime = scaleTime * Math.abs(num - thisNum);
        var times = 25 * Math.abs(num - thisNum) + 1;
        bg.runAction(cc.sequence(
            cc.sequence(
                cc.callFunc(function () {
                    bg.width += delta / times;
                    if (isTime) this.lbTime.width += delta / times;
                }.bind(this)),
                cc.delayTime(benefitTime / times)
            ).repeat(times),
            cc.callFunc(function () {
                bg.width = targetWidth;
                if (isTime) this.lbTime.width = targetWidth;
            }.bind(this))
        ));

        var list = isTime? this.listTime : this.list;
        for (var i = 0; i < Math.max(list.length, num); i++) {
            var cell;
            if (i >= list.length) {
                cell = new VipBenefitCell();
                cell.setPosition(cc.p(
                    (isTime? -1 : 1) * (
                        VipBenefitNode.MARGIN_SIDE
                        + (i + 0.5) * VipBenefitCell.WIDTH
                        + i * VipBenefitNode.MARGIN_CELL
                    ),
                    0
                ));
                this.addChild(cell);
                list.push(cell);
            } else {
                cell = list[i];
            }

            if (thisNum < num) {
                if (thisNum <= i && i < num) {
                    cell.effectShow(thisNum, scaleTime, i);
                } else {
                    cell.show(i < num);
                }
            } else if (num < thisNum) {
                if (num <= i && i < thisNum) {
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

    setBenefit: function (level) {
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
        this.changeBenefit(numTime, true);
        this.changeBenefit(num, false);
        this.lbTime.setVisible(level === vipMgr.getVipLevel());

        for (var i = 0; i < listBenefit.length; i++) {
            if (listBenefit[i].isTime) {
                this.listTime[listBenefit[i].num].setInfo(listBenefit[i], true, level);
            } else {
                this.list[listBenefit[i].num].setInfo(listBenefit[i], false, level);
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
        var color = remainTime > 0 ? cc.color("#ffd863") : cc.color("#dd4d4d");
        this.lbTime.setColor(color);
    },
});
VipBenefitNode.MARGIN_SIDE = 10.5;
VipBenefitNode.MARGIN_CELL = 2;

var VipBenefitCell = BaseLayer.extend({
    ctor: function () {
        this.level = 0;
        this.index = 0;
        this.dataValue = 0;
        this.closedAngle = -45;
        this.delayTime = 15;

        this._super();
        this.initWithBinaryFile("VipBenefitCell.json");
    },

    initGUI: function () {
        this.bg = this.getControl("bg");
        this.title = this.getControl("title");
        this.img = this.getControl("img");
        this.value = this.getControl("value");
        this.maxStamp = this.getControl("max");
        this.maxStamp.setVisible(false);
        this.explain = this.getControl("explain");
        this.explain.setVisible(false);
        this.explain.setOpacity(0);
        this.explain.setRotation(this.closedAngle);
        this.lbExplain = this.getControl("label", this.explain);

        this.btn = this.customButton("btn", 0);
    },

    setInfo: function (benefit, isTime, level) {
        this.title.setString(vipMgr.getBenefitName(benefit["index"]));
        this.img.loadTexture(vipMgr.getImageBenefit(benefit["index"]));
        // this.value.setString(vipMgr.getValueBenefit(benefit["index"], benefit["value"]));
        this.bg.loadTexture("res/Lobby/GUIVipNew/bgBenefit" + (isTime? "_time.png" : ""));
        this.bg.setOpacity(level >= vipMgr.getVipLevel()? 255 : 100);

        var valueResult = vipMgr.getValuePhrase(benefit["index"], benefit["value"]);
        if (valueResult) {
            cc.log("VALUE RESULT", JSON.stringify(valueResult), benefit["index"], this.dataValue, benefit["value"]);
            effectMgr.runNumberLabelEffect(
                this.value,
                this.dataValue,
                benefit["value"],
                0,
                25,
                valueResult.type,
                valueResult.phrase
            );
        } else {
            this.value.setString(vipMgr.getValueBenefit(benefit["index"], benefit["value"]));
        }

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
        this.bg.stopAllActions();
        this.bg.setVisible(true);
        this.bg.runAction(cc.sequence(
            cc.delayTime((i - thisNum + 0.5) * scaleTime),
            cc.scaleTo(scaleTime / 2, 1).easing(cc.easeIn(2))
        ));
        this.explain.setVisible(false);
    },

    effectHide: function (thisNum, scaleTime, i) {
        this.bg.stopAllActions();
        this.bg.runAction(cc.sequence(
            cc.delayTime((thisNum - i - 1) * scaleTime),
            cc.spawn(
                cc.scaleTo(scaleTime, 0).easing(cc.easeOut(2)),
                cc.fadeOut(scaleTime)
            ),
            cc.hide()
        ));
        this.explain.setVisible(false);
    },

    show: function (isShow) {
        this.bg.setVisible(isShow);
    },

    openExplain: function () {
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
                this.getParent().closeOtherExplain(this);
                break;
        }
    }
});
VipBenefitCell.WIDTH = 95;
VipBenefitCell.HEIGHT = 130;

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