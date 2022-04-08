var VipScene = BaseLayer.extend({
    ctor: function () {
        this._super();
        this.initWithBinaryFile("VipScene.json");
    },

    initGUI: function () {
        this.bg = this.getControl("bg");

        this.listVip = this.getControl("listVip");
        this.listVip.maxX = this.listVip.x;
        this.listVip.minX = this.listVip.x - this.listVip.width;
        this.listVip.boundRange = cc.winSize.width * 0.15;
        this.listImg = [];
        for (var i = 0; i < VipScene.TOTAL_VIP; i++) {
            var nodeVip = this.getControl("vip_" + i, this.listVip);
            var img = this.customButton("vip", VipScene.BTN_VIP, nodeVip);
            var image = this.getControl("img", nodeVip);
            img.setCascadeOpacityEnabled(false);
            img.setOpacity(0);
            img.setSwallowTouches(false);
            img.vipId = i;
            var effect = db.DBCCFactory.getInstance().buildArmatureNode("Gem");
            img.addChild(effect);
            effect.setPosition(cc.p(img.width / 2, img.height / 2));
            effect.defaultPos = effect.getPosition();
            if (i > 0) {
                effect.gotoAndPlay("lv" + i + "_1", -1, -1, 0);
                image.setVisible(false);
            } else {
                effect.setVisible(false);
                effect = image;
            }
            nodeVip.effect = effect;
            nodeVip.lock = this.getControl("lock", nodeVip);
            nodeVip.name = this.getControl("name", nodeVip);
            nodeVip.vPoint = this.getControl("vPoint", nodeVip);
            nodeVip.vPoint.setCascadeColorEnabled(false);
            nodeVip.expired = this.getControl("expired", nodeVip);
            nodeVip.expired.setVisible(false);
            nodeVip.expired.setOpacity(0);
            nodeVip.expired.setScale(0);
            nodeVip.setLocalZOrder(10);
            nodeVip.expired.big = this.getControl("big", nodeVip.expired);
            nodeVip.expired.big.defaultSize = nodeVip.expired.big.getContentSize();
            nodeVip.expired.big.setVisible(false);
            nodeVip.expired.small = this.getControl("small", nodeVip.expired);
            nodeVip.expired.small.defaultSize = nodeVip.expired.small.getContentSize();
            this.customButton("btn", VipScene.BTN_EXPIRED, nodeVip.expired);
            this.customButton("btnClose", VipScene.BTN_EXPIRED_CLOSE, nodeVip.expired);
            // this.customButton("btnOpen", VipScene.BTN_EXPIRED_OPEN, nodeVip.expired);
            this.listImg.push(nodeVip);
        }
        this.btnClose = this.customButton("btnClose", VipScene.BTN_BACK);

        this.benefit = new VipBenefitNode();
        this.pBenefit = this.getControl("pBenefit");
        this.pBenefit.addChild(this.benefit);

        var btnHelp = this.getControl("btnHelp");
        this.helpNode = new VipHelpNode(btnHelp, cc.p(btnHelp.width * 0.5, btnHelp.height * 0.5));

        this.bgVipProgress = this.getControl("bgProgress", this.listVip);
        this.bgVipProgress.width = this.listVip.width + VipScene.PROGRESS_BG_OFFSET * 2;
        this.bgVipProgress.x = -VipScene.PROGRESS_BG_OFFSET;
        this.vipProgress = this.getControl("progress", this.bgVipProgress);
        this.vipProgress.width = this.bgVipProgress.width - VipScene.PROGRESS_OFFSET * 2;

        this.pDot = this.getControl("pDot", this.bgVipProgress);
        for (var i = 0; i <= VipManager.NUMBER_VIP; i++) {
            var dot = this.getControl("dot_" + i, this.pDot);
            dot.x = VipScene.PROGRESS_BG_OFFSET + this.listVip.width * (i / VipManager.NUMBER_VIP);
        }

        this.pDecor = this.getControl("pDecor");
        this.pDecor.arrow = [];
        for (var i = 0; i < 4; i++) {
            this.pDecor.arrow.push(this.getControl("arrow_" + i, this.pDecor));
        }
        this.pDecor.light = [];
        for (var i = 0; i < 2; i++) {
            this.pDecor.light.push(this.getControl("light_" + i, this.pDecor));
        }
        this.pDecor.vipSparkle = this.getControl("vipSparkle", this.pDecor);

        this.touched = null;
        this.moved = false;
        this.touchedVip = false;
        this.closest = 0;
        this.addTouchListener();
        this.setBackEnable(true);

        //Cheat
        VipScene.initCheat(this);
        this.customButton("btnEfxFly", VipScene.BTN_CHEAT_FLY, this.pCheat);
        this.customButton("btnEfxLevel", VipScene.BTN_CHEAT_LEVEL, this.pCheat);
        this.customButton("btnEfxProgressLevel", VipScene.BTN_CHEAT_PROGRESS_LEVEL, this.pCheat);
        this.customButton("btnReceived", VipScene.BTN_CHEAT_RECEIVED, this.pCheat);
    },

    addTouchListener: function () {
        var self = this;
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan: function (touch, event) {
                self.moved = false;
                self.touched = touch.getLocation();
                self.helpNode.turnOff();
                return true;
            },
            onTouchMoved: function (touch, event) {
                var delta = touch.getDelta();
                if (self.touched && Math.abs(self.touched.x - touch.getLocation().x) > 10) {
                    self.moved = true;
                    self.listVip.stopAllActions();
                    self.normalizeAllVip();
                    self.touched = null;
                }
                self.movingImage();
                if (self.listVip.x < self.listVip.minX) {
                    delta.x *= Math.max(0,
                        (self.listVip.boundRange - Math.abs(self.listVip.x - self.listVip.minX)) / self.listVip.boundRange);
                } else if (self.listVip.x > self.listVip.maxX) {
                    delta.x *= Math.max(0,
                        (self.listVip.boundRange - Math.abs(self.listVip.x - self.listVip.maxX)) / self.listVip.boundRange);
                } else {
                    delta.x *= 1.5;
                }
                var desX = self.listVip.x + delta.x;
                desX = Math.min(desX, self.listVip.maxX + self.listVip.boundRange);
                desX = Math.max(desX, self.listVip.minX - self.listVip.boundRange);
                self.listVip.x = desX;
            },
            onTouchEnded: function (touch, event) {
                cc.log("onTouchEnded", self.moved, self.touchedVip);
                if (!self.moved && self.touchedVip) {
                    self.touchedVip = false;
                    return;
                }
                self.touchedVip = false;
                var offset = self.listVip.defaultPos.x - self.listVip.x;
                var closest = 0;
                for (var i = 1; i < self.listImg.length; i++) {
                    if (Math.abs(offset - self.listImg[i].x) < Math.abs(offset - self.listImg[closest].x)) {
                        closest = i;
                    }
                }
                self.snapToNearestVip(closest);
            }
        }, this);
    },

    onEnterFinish: function () {
        shopData.initShopData();

        this.touched = null;
        this.helpNode.reset();
        this.normalizeAllVip();
        this.runDecor();
        this.setInfo();
        this.scheduleUpdate();
        this.effectIn();
    },

    effectIn: function () {
        var effectTime = 0.25;
        var delayTime = 0;

        for (var i = 0; i < this.listImg.length; i++) {
            var img = this.listImg[i];
            img.stopAllActions();
            img.setScale(0);
            img.runAction(cc.sequence(
                cc.delayTime(delayTime + Math.abs(i - this.closest) * 0.15),
                cc.scaleTo(effectTime, 1).easing(cc.easeBackOut())
            ));
        }
        delayTime += 0.15 * 2;

        this.btnClose.stopAllActions();
        this.btnClose.setPosition(cc.p(this.btnClose.defaultPos.x, cc.winSize.height + this.btnClose.width * 0.5));
        this.btnClose.setOpacity(0);
        this.btnClose.runAction(cc.sequence(
            cc.delayTime(delayTime),
            cc.spawn(
                cc.fadeIn(effectTime * 0.5).easing(cc.easeOut(2.5)),
                cc.moveTo(effectTime, this.btnClose.defaultPos).easing(cc.easeBackOut())
            )
        ));
        delayTime += 0.15;

        var title = this.getControl("title", this.getControl("pTopLeft"));
        title.stopAllActions();
        title.setPosition(cc.p(title.defaultPos.x, cc.winSize.height + title.width * 0.5));
        title.setOpacity(0);
        title.runAction(cc.sequence(
            cc.delayTime(delayTime),
            cc.spawn(
                cc.fadeIn(effectTime * 0.5).easing(cc.easeOut(2.5)),
                cc.moveTo(effectTime, title.defaultPos).easing(cc.easeBackOut())
            )
        ));
        delayTime += 0.15;

        var pTopRight = this.getControl("pTopRight");
        pTopRight.stopAllActions();
        pTopRight.setPosition(cc.p(pTopRight.defaultPos.x, cc.winSize.height + pTopRight.width));
        pTopRight.setOpacity(0);
        pTopRight.runAction(cc.sequence(
            cc.delayTime(delayTime),
            cc.spawn(
                cc.fadeIn(effectTime * 0.5).easing(cc.easeOut(2.5)),
                cc.moveTo(effectTime, pTopRight.defaultPos).easing(cc.easeBackOut())
            )
        ));
        delayTime += 0.15;

        this.pBenefit.stopAllActions();
        this.pBenefit.setScaleY(0);
        this.pBenefit.runAction(cc.sequence(
            cc.delayTime(delayTime),
            cc.scaleTo(effectTime, 1).easing(cc.easeBackOut())
        ));
        delayTime += 0.15;
    },

    runDecor: function () {
        for (var i = 0; i < this.pDecor.arrow.length; i++) {
            var arrow = this.pDecor.arrow[i];
            var timeDelay = 0.5;
            arrow.stopAllActions();
            arrow.setOpacity(0);
            arrow.runAction(cc.sequence(
                cc.delayTime(Math.floor(i / 2) * timeDelay),
                cc.callFunc(function () {
                    this.runAction(cc.sequence(
                        cc.moveTo(0, this.defaultPos),
                        cc.fadeOut(0),
                        cc.spawn(
                            cc.fadeIn(1.5 * 0.5).easing(cc.easeOut(2.5)),
                            cc.moveTo(1.5, cc.p(
                                cc.winSize.width * 0.5 * (1 + this.getScaleX()),
                                this.defaultPos.y
                            )).easing(cc.easeOut(2.5))
                        )
                    ).repeatForever());
                }.bind(arrow))
            ));
        }
        this.pDecor.vipSparkle.removeAllChildren();
    },

    runLight: function () {
        cc.log("RUN LIGHT");
        for (var i = 0; i < this.pDecor.light.length; i++) {
            var light = this.pDecor.light[i];
            VipScene.runLightEffect(light, i);
        }
        this.pDecor.vipSparkle.stopAllActions();
        this.pDecor.vipSparkle.runAction(cc.scaleTo(0.25, 1));
    },

    hideLight: function () {
        cc.log("HIDE LIGHT");
        for (var i = 0; i < this.pDecor.light.length; i++) {
            var light = this.pDecor.light[i];
            light.stopAllActions();
            light.runAction(
                cc.fadeOut(0.1)
            );
        }
        this.pDecor.vipSparkle.stopAllActions();
        this.pDecor.vipSparkle.runAction(cc.scaleTo(0.25, 0));
    },

    setInfo: function () {
        VipManager.checkShowUpLevelVip();
        vipMgr.updateFromSaveData();
        var vipLevel = vipMgr.getVipLevel();
        var currentVPoint = vipMgr.getVpoint() + vipMgr.getTotalVpointNeeded(vipLevel - 1);
        var targetVPoint = vipMgr.getTotalVpointNeeded(vipLevel);
        cc.log("SET INFO FOR NEW VIP SCENE", vipLevel, currentVPoint, targetVPoint);

        this.snapToNearestVip(vipLevel);

        for (var i = 0; i < this.listImg.length; i++) {
            this.listImg[i].name.setString("VIP " + (i === 0 ? "FREE" : i));
            this.listImg[i].lock.setVisible(i > vipLevel);
            if (i === vipLevel + 1 || (i === vipLevel && i === VipManager.NUMBER_VIP)) {
                this.listImg[i].vPoint.setString(
                    StringUtility.pointNumber(currentVPoint) + "/" + StringUtility.pointNumber(targetVPoint)
                );
            } else if (i === 0) {
                this.listImg[i].vPoint.setVisible(false);
            } else {
                this.listImg[i].vPoint.setString(StringUtility.pointNumber(vipMgr.getTotalVpointNeeded(i - 1)));
            }
            this.listImg[i].vPoint.x = this.listImg[i].vPoint.defaultPos.x
                - StringUtility.getLabelWidth(this.listImg[i].vPoint) * 0.5
                + 17.5;
            this.listImg[i].vPoint.setColor(i > vipLevel + 1 ? VipScene.TINT_COLOR : cc.WHITE);

            var lbExpired = this.getControl("label", this.listImg[i].expired.small);
            lbExpired.setString(LocalizedString.to("VIP_TIME_UP") + " VIP " + i);
            lbExpired = this.getControl("label", this.listImg[i].expired.big);
            lbExpired.setString(LocalizedString.to("VIP_TIME_UP") + " VIP " + i);

        }
        var posVPoint = this.listImg[vipLevel].defaultPos.x;
        posVPoint += this.listVip.width * 0.1 * (vipMgr.getVpoint() / vipMgr.getVpointNeed(vipLevel));
        this.vipProgress.width = Math.min(posVPoint, this.listVip.width) + (VipScene.PROGRESS_BG_OFFSET - VipScene.PROGRESS_OFFSET) * 2;
    },

    normalizeAllVip: function () {
        var effectTime = 0.25;
        for (var i = 0; i < VipScene.TOTAL_VIP; i++) {
            this.listImg[i].effect.stopAllActions();
            this.listImg[i].effect.runAction(cc.spawn(
                cc.scaleTo(effectTime, 1).easing(cc.easeBackIn()),
                cc.moveTo(effectTime, cc.p(
                    this.listImg[i].effect.defaultPos
                )).easing(cc.easeBackIn())
            ));

            this.listImg[i].stopAllActions();
            this.listImg[i].runAction(cc.moveTo(effectTime, this.listImg[i].defaultPos));
            if (i > 0) {
                this.listImg[i].effect.gotoAndPlay("lv" + i + "_1", -1, -1, 0);
            } else {
                // this.listImg[i].effect.setVisible(false);
            }

            var expired = this.listImg[i].expired;
            expired.stopAllActions();
            expired.runAction(cc.spawn(
                cc.scaleTo(effectTime, 0).easing(cc.easeBackIn(2.5)),
                cc.fadeOut(effectTime).easing(cc.easeOut(2.5))
            ));
        }

        this.movingImage();
        this.hideLight();
    },

    movingImage: function () {
        var threshHold = 0.15;
        var iThreshHold = 1 - threshHold;
        var color = VipScene.TINT_COLOR;
        var opacity = 100;

        for (var i = 0; i < this.listImg.length; i++) {
            var pos = this.listImg[i].getParent().convertToWorldSpace(this.listImg[i].getPosition());
            if (cc.winSize.width * threshHold < pos.x && pos.x < cc.winSize.width * iThreshHold) {
                var child = cc.winSize.width * (0.5 - threshHold) - Math.abs(pos.x - cc.winSize.width * 0.5);
                var mother = cc.winSize.width * (0.5 - threshHold);
                var ratio = child / mother;
                this.listImg[i].effect.setColor(cc.color(
                    color.r + ratio * (255 - color.r),
                    color.g + ratio * (255 - color.g),
                    color.b + ratio * (255 - color.b)
                ));
                this.listImg[i].name.setColor(cc.color(
                    color.r + ratio * (255 - color.r),
                    color.g + ratio * (255 - color.g),
                    color.b + ratio * (255 - color.b)
                ));
            } else {
                this.listImg[i].effect.setColor(color);
                this.listImg[i].name.setColor(color);
            }
        }
    },

    snapToNearestVip: function (closest) {
        cc.log("snapToNearestVip", closest);
        var offset = this.listVip.defaultPos.x - this.listVip.x;
        var time = 0.5;
        time = Math.min(
            time * 0.5,
            time * (Math.abs(offset - this.listImg[closest].x) / (this.listVip.width / (VipScene.TOTAL_VIP + 1)))
        );
        this.listVip.stopAllActions();
        this.listVip.runAction(cc.moveTo(
            time,
            cc.p(this.listVip.defaultPos.x - this.listImg[closest].defaultPos.x, this.listVip.defaultPos.y)
        ).easing(cc.easeOut(2)));

        this.listImg[closest].setLocalZOrder(10);
        var effectTime = 0.25;
        var effect = this.listImg[closest].effect;
        effect.stopAllActions();
        effect.runAction(cc.spawn(
            cc.scaleTo(effectTime, 1.5).easing(cc.easeBackOut()),
            cc.tintTo(effectTime, cc.color("#ffffff")),
            cc.fadeIn(effectTime),
            cc.moveTo(effectTime, effect.defaultPos).easing(cc.easeBackOut())
        ));
        // effect.setScale(0);
        if (closest > 0 && effect.scaleX < 1.5) {
            effect.gotoAndPlay("lv" + closest + "_0", -1, -1, 1);
            effect.setCompleteListener(function () {
                this.gotoAndPlay("lv" + closest + "_1", -1, -1, 0);
            }.bind(effect));
        }
        this.listImg[closest].name.setColor(cc.WHITE);

        var expired = this.listImg[closest].expired;
        expired.stopAllActions();
        expired.setVisible(false);
        expired.setOpacity(0);
        expired.setScale(0);


        for (var i = 0; i < this.listImg.length; i++) {
            if (i !== closest) {
                this.listImg[i].stopAllActions();
                this.listImg[i].runAction(
                    cc.scaleTo(effectTime, 1).easing(cc.easeBackOut())
                );
                this.listImg[i].effect.runAction(
                    cc.tintTo(effectTime, VipScene.TINT_COLOR).easing(cc.easeBackOut())
                );
                this.listImg[i].name.setColor(VipScene.TINT_COLOR);
                this.listImg[i].setLocalZOrder(0);
            }
        }
        if (this.closest !== closest) {
            this.benefit.setBenefit(closest);
            this.benefit.updatePosition(effectTime);
        }
        if (closest === vipMgr.getVipLevel()) {
            this.runLight();

            var remainTime = vipMgr.getRemainTime();
            if (remainTime <= 0) {
                expired.setVisible(true);
                expired.runAction(cc.sequence(
                    cc.delayTime(1),
                    cc.spawn(
                        cc.scaleTo(effectTime, 1).easing(cc.easeIn(2.5)),
                        cc.fadeIn(effectTime).easing(cc.easeIn(2.5))
                    )
                ));
                this.effectExpiredShow(expired);
            }
        }

        this.closest = closest;
    },

    effectExpiredShow: function (expired, delayTime = 3) {
        expired.big.stopAllActions();
        expired.big.setVisible(false);
        expired.big.setOpacity(255);
        expired.big.setContentSize(expired.big.defaultSize);

        expired.small.stopAllActions();
        expired.small.setVisible(true);
        expired.small.setOpacity(255);
        expired.small.setContentSize(expired.small.defaultSize);

        var delaySmallTime = 0.1;
        var efxSizeTime = 0.25;
        var efxSwitchTime = 0.25;
        var delta = 2.5;
        var times = Math.ceil(Math.max(
            (expired.big.width - expired.small.width) / delta,
            (expired.big.height - expired.small.height) / delta
        ));

        expired.setPosition(expired.defaultPos);
        expired.runAction(cc.sequence(
            cc.delayTime(delayTime),
            cc.moveTo(efxSizeTime, expired.defaultPos.x + 50, expired.defaultPos.y)
        ));

        expired.small.runAction(cc.sequence(
            cc.delayTime(delayTime),
            cc.sequence(
                cc.callFunc(function () {
                    expired.small.width += delta;
                    expired.small.width = Math.min(expired.small.width, expired.big.width);
                    expired.small.height += delta;
                    expired.small.height = Math.min(expired.small.height, expired.big.height);
                }.bind(this)),
                cc.delayTime(efxSizeTime / times)
            ).repeat(times),
            cc.callFunc(function () {
                expired.small.width = expired.big.width;
                expired.small.height = expired.big.height;
            }.bind(this)),
            cc.delayTime(delaySmallTime),
            cc.fadeOut(efxSwitchTime),
            cc.hide()
        ));

        expired.big.runAction(cc.sequence(
            cc.delayTime(delayTime + efxSizeTime),
            cc.show()
        ));

        var labelSmall = this.getControl("label", expired.small);
        var labelBig = this.getControl("label", expired.big);

        labelSmall.stopAllActions();
        labelSmall.setPosition(labelSmall.defaultPos);
        labelSmall.runAction(cc.sequence(
            cc.delayTime(delayTime),
            cc.moveTo(efxSizeTime, labelBig.defaultPos).easing(cc.easeBackOut(2.5))
        ));

        labelBig.stopAllActions();
        labelBig.setPosition(labelBig.defaultPos);

        var labelLong = this.getControl("labelLong", expired.big);
        var btn = this.getControl("btn", expired.big);
        var btnClose = this.getControl("btnClose", expired.big);

        btn.stopAllActions();
        btn.setOpacity(255);
        btnClose.stopAllActions();
        btnClose.setOpacity(255);
        labelLong.stopAllActions();
        labelLong.setOpacity(255);
    },

    effectExpiredHide: function (expired) {
        expired.big.stopAllActions();
        expired.small.stopAllActions();
        expired.small.setVisible(false);
        expired.small.setContentSize(expired.small.defaultSize);

        var efxSizeTime = 0.25;
        var efxSwitchTime = 0.25;
        var delta = 2.5;
        var times = Math.ceil(Math.max(
            (expired.big.width - expired.small.width) / delta,
            (expired.big.height - expired.small.height) / delta
        ));

        expired.runAction(cc.moveTo(efxSizeTime, expired.defaultPos));

        expired.big.runAction(cc.sequence(
            cc.sequence(
                cc.callFunc(function () {
                    expired.big.width -= delta;
                    expired.big.width = Math.max(expired.small.width, expired.big.width);
                    expired.big.height -= delta;
                    expired.big.height = Math.max(expired.small.height, expired.big.height);
                }.bind(this)),
                cc.delayTime(efxSizeTime / times)
            ).repeat(times),
            cc.callFunc(function () {
                expired.big.width = expired.small.width;
                expired.big.height = expired.big.height;
            }.bind(this)),
            cc.delayTime(efxSwitchTime),
            cc.hide()
        ));

        expired.small.runAction(cc.sequence(
            cc.delayTime(efxSizeTime),
            cc.show(),
            cc.fadeIn(efxSwitchTime)
        ));

        var labelSmall = this.getControl("label", expired.small);
        var labelBig = this.getControl("label", expired.big);

        labelBig.stopAllActions();
        labelBig.setPosition(labelBig.defaultPos);
        labelBig.runAction(cc.moveTo(efxSizeTime, labelSmall.defaultPos).easing(cc.easeBackOut(2.5)));

        labelSmall.stopAllActions();
        labelSmall.setPosition(labelSmall.defaultPos);

        var labelLong = this.getControl("labelLong", expired.big);
        var btn = this.getControl("btn", expired.big);
        var btnClose = this.getControl("btnClose", expired.big);

        var smallTime = 0.1;
        btn.stopAllActions();
        btn.runAction(cc.fadeOut(smallTime));
        btnClose.stopAllActions();
        btnClose.runAction(cc.fadeOut(smallTime));
        labelLong.stopAllActions();
        labelLong.runAction(cc.fadeOut(smallTime));
    },

    update: function (dt) {
        this.benefit.update(dt);

        if (Math.random() < 0.025) {
            var vipSparkle = new VipSparkle();
            this.pDecor.vipSparkle.addChild(vipSparkle);
            vipSparkle.startEffect();
        }
    },

    onButtonTouched: function (button, id) {
        switch (id) {
            case VipScene.BTN_VIP:
                this.touchedVip = true;
                break;
            default:
                this.touchedVip = false;
                break;
        }
    },

    onButtonRelease: function (button, id) {
        this.helpNode.turnOff();
        switch (id) {
            case VipScene.BTN_BACK:
                this.onBack();
                break;
            case VipScene.BTN_HELP:
                break;
            case VipScene.BTN_VIP:
                if (!this.moved) {
                    this.normalizeAllVip();
                    this.snapToNearestVip(button.vipId);
                }
                break;
            case VipScene.BTN_CHEAT:
                var status = Math.round(Math.abs(this.pCheat.x - cc.winSize.width) / this.pCheat.width + 1);
                this.pCheat.x = cc.winSize.width - (status % 2) * this.pCheat.width;
                break;
            case VipScene.BTN_CHEAT_OLD:
                var cheatOld = new CmdSendCheatOldVip();
                cheatOld.putData(
                    this.pOldCheat.level.getString() || 0,
                    this.pOldCheat.gstar.getString() || 0,
                    parseFloat(this.pOldCheat.remainTime.getString() || 0) * 1000
                );
                GameClient.getInstance().sendPacket(cheatOld);
                break;
            case VipScene.BTN_CHEAT_NEW:
                var cheatNew = new CmdSendCheatNewVip();
                cheatNew.putData(
                    this.pNewCheat.level.getString() || 0,
                    this.pNewCheat.vPoint.getString() || 0,
                    parseFloat(this.pNewCheat.remainTime.getString() || 0) * 1000
                );
                GameClient.getInstance().sendPacket(cheatNew);
                break;
            case VipScene.BTN_CHEAT_FLY:
                break;
            case VipScene.BTN_CHEAT_LEVEL:
                VipManager.showUpLevelVip(3, 4);
                break;
            case VipScene.BTN_CHEAT_PROGRESS_LEVEL:
                break;
            case VipScene.BTN_CHEAT_RECEIVED:
                receivedMgr.onShopGoldSuccess(
                    "TESTING",
                    {"shopGG":[100],"shopGoldGold":[0],"shopGoldVPoint":[0],"shopGoldVipHour":[0],"purchaseId":["9031cf90-a5cc-43bc-8673-a82569c20ccb"],"createdTime":[1648004588645],"paymentType":[1606],"value":[10000],"missionGold":[0],"offerGold":[0],"offerDiamond":[0],"offerVPoint":[0],"offerVipHour":[0],"offerItemType":[""],"offerItemSubType":[""],"offerItemId":[""],"offerItemNumber":[""],"voucherGold":[0],"voucherVPoint":[0],"vipGold":[0],"shopEventGold":[0],"eventId":[""],"eventTicket":[""],"eventReason":[""],"eventVPoint":[0],"eventVipHour":[0],"webGold":[0]}
                    );
                break;
            case VipScene.BTN_EXPIRED:
                cc.log("WHAT VipScene.BTN_EXPIRED");
                paymentMgr.openShop(this._id, true);
                // sceneMgr.openGUI(VipExpiredOffer.className);
                break;
            case VipScene.BTN_EXPIRED_CLOSE:
                this.effectExpiredHide(this.listImg[this.closest].expired);
                break;
            case VipScene.BTN_EXPIRED_OPEN:
                // this.effectExpiredShow(this.listImg[this.closest].expired, 0);
                break;
        }
    },

    onBack: function () {
        if (sceneMgr.checkBackAvailable()) return;
        sceneMgr.openScene(LobbyScene.className);
    }
});
VipScene.className = "VipScene";
VipScene.TOTAL_VIP = 11;
VipScene.BENEFIT_MARGIN = 25;
VipScene.PROGRESS_BG_OFFSET = 9;
VipScene.PROGRESS_OFFSET = 2.5;

VipScene.BTN_BACK = 0;
VipScene.BTN_HELP = 1;
VipScene.BTN_EXPIRED = 2;
VipScene.BTN_EXPIRED_CLOSE = 3;
VipScene.BTN_EXPIRED_OPEN = 4;
VipScene.BTN_VIP = 100;
VipScene.BTN_CHEAT = 200;
VipScene.BTN_CHEAT_OLD = 201;
VipScene.BTN_CHEAT_NEW = 202;
VipScene.BTN_CHEAT_FLY = 203;
VipScene.BTN_CHEAT_LEVEL = 204;
VipScene.BTN_CHEAT_PROGRESS_LEVEL = 205;
VipScene.BTN_CHEAT_RECEIVED = 206;

VipScene.initCheat = function (theGUI) {
    theGUI.pCheat = theGUI.getControl("pCheat");
    theGUI.btnCheat = theGUI.customButton("btnCheat", VipScene.BTN_CHEAT, theGUI.pCheat);
    theGUI.btnCheat.setVisible(Config.ENABLE_CHEAT);

    theGUI.pOldCheat = theGUI.getControl("pOldCheat", theGUI.pCheat);
    theGUI.pOldCheat.level = theGUI.getControl("level", theGUI.pOldCheat);
    theGUI.pOldCheat.gstar = theGUI.getControl("gstar", theGUI.pOldCheat);
    theGUI.pOldCheat.remainTime = theGUI.getControl("remainTime", theGUI.pOldCheat);
    theGUI.customButton("btnCheatOld", VipScene.BTN_CHEAT_OLD, theGUI.pCheat);

    theGUI.pNewCheat = theGUI.getControl("pNewCheat", theGUI.pCheat);
    theGUI.pNewCheat.level = theGUI.getControl("level", theGUI.pNewCheat);
    theGUI.pNewCheat.vPoint = theGUI.getControl("vPoint", theGUI.pNewCheat);
    theGUI.pNewCheat.remainTime = theGUI.getControl("remainTime", theGUI.pNewCheat);
    theGUI.customButton("btnCheatNew", VipScene.BTN_CHEAT_NEW, theGUI.pCheat);
}

VipScene.runLightEffect = function (light, i) {
    light.stopAllActions();
    light.runAction(cc.rotateBy(Math.random() * 2.5 + 15, i === 0? 360 : -360).repeatForever());
    var big = 1 + Math.random() * 0.5;
    var small = 1 - Math.random() * 0.5;
    light.runAction(cc.sequence(
        cc.scaleTo(Math.random() * 2.5 + 10, big, big),
        cc.scaleTo(Math.random() * 2.5 + 10, small, small)
    ).repeatForever());
    light.runAction(
        cc.fadeIn(0.1)
    );
}

VipScene.TINT_COLOR = cc.color("#7489d7");

//VipSparkle
var VipSparkle = cc.Node.extend({
    ctor: function () {
        this._super();
        this.initChild();
    },

    initChild: function () {
        this.setCascadeOpacityEnabled(true);
        var file = "res/Lobby/Vip/particle/dot.png";
        this.spriteImg = new cc.Sprite(file);
        this.addChild(this.spriteImg);
        this.spriteImg.setScale(Math.random() + 0.5);
    },

    startEffect: function (delayTime = 0) {
        var parent = this.getParent();
        this.setPosition(cc.p(parent.width * 0.5, parent.height * 0.5));
        this.setRotation(360 * Math.random());
        var height = 150 + Math.random() * 50;
        var rTime = (5 + Math.random() * 2.5);

        this.spriteImg.runAction(cc.sequence(
            cc.delayTime(1.25),
            cc.callFunc(function () {
                var time = 0.5 + Math.random() * 0.5;
                this.spriteImg.runAction(cc.sequence(
                    cc.spawn(
                        cc.fadeTo(0.25, 125 * Math.random()),
                        cc.scaleTo(0.25, 0.2 * Math.random()).easing(cc.easeIn(5))
                    ),
                    cc.delayTime(time - 0.25),
                    cc.spawn(
                        cc.fadeTo(0.25, 200 + Math.random() * 50),
                        cc.scaleTo(0.25, Math.random() + 0.5).easing(cc.easeOut(5))
                    )
                ));
            }.bind(this))
        ).repeatForever());

        this.spriteImg.setVisible(false);
        this.spriteImg.runAction(cc.sequence(
            cc.delayTime(delayTime),
            cc.show(),
            cc.moveBy(rTime, 0, height).easing(cc.easeIn(2))
        ));

        this.runAction(cc.sequence(
            cc.delayTime(delayTime + rTime - 0.1),
            cc.fadeOut(0.1),
            cc.removeSelf()
        ));
    }
});

var VipStarter = BaseLayer.extend({
    ctor: function () {
        this._super();
        this.initWithBinaryFile("VipStarter.json");
    },

    initGUI: function () {
        VipScene.initCheat(this);

        this.bg = this.getControl("bg");
        this.customButton("btnClose", VipStarter.BTN_CLOSE, this.bg);
        this.customButton("btnGo", VipStarter.BTN_GO, this.bg);

        this.bgBenefit = this.getControl("bgBenefit", this.bg);
        this.scrollView = this.getControl("scrollView", this.bgBenefit);
        this.progressVip = this.getControl("progressVip", this.bg);
        this.lbProgress = this.getControl("lbProgress", this.progressVip);
        var btnHelp = this.getControl("btnHelp", this.progressVip);
        this.helpNode = new VipHelpNode(btnHelp, cc.p(btnHelp.width * 0.5, btnHelp.height * 0.5));
        this.helpNode.helpBg.setAnchorPoint(cc.p(1, 0));
        this.helpNode.helpBg.setPosition(cc.p(-this.helpNode.helpBg.x, -this.helpNode.helpBtn.height * 0.5));
        this.description = this.getControl("description", this.bg);

        this.list = [];

        this.enableFog();
    },

    onEnterFinish: function () {
        this.helpNode.reset();
        this.setShowHideAnimate(this.bg);

        this.setInfo();
    },

    setInfo: function () {
        var listBenefit = vipMgr.getListBenefit(VipManager.NUMBER_VIP);

        listBenefit.sort(function (a, b) {
            return VipManager.BENEFIT_ORDER[parseInt(a["index"])] - VipManager.BENEFIT_ORDER[parseInt(b["index"])];
        });

        cc.log("HOW MANY?", JSON.stringify(listBenefit));

        for (var i = 0; i < listBenefit.length; i++) {
            var cell;
            if (i >= this.list.length) {
                cell = new VipBenefitCell();
                cell.setPosition(cc.p(
                    (i + 0.5) * VipBenefitCell.WIDTH + i * VipBenefitNode.MARGIN_CELL,
                    this.scrollView.height / 2
                ));
                this.scrollView.addChild(cell);
                this.list.push(cell);
            } else {
                cell = this.list[i];
            }
            cell.setInfo(listBenefit[i], false, VipManager.NUMBER_VIP);
            cell.btn.setVisible(false);
            cell.maxStamp.setVisible(!vipMgr.getIsUnlocked(listBenefit[i]["index"]));
        }

        this.scrollView.innerWidth = listBenefit.length * VipBenefitCell.WIDTH
            + (listBenefit.length - 1) * VipBenefitNode.MARGIN_CELL;
        this.scrollView.setScrollBarEnabled(false);

        this.lbProgress.setString(
            vipMgr.getVpoint() + "/" + vipMgr.getVpointNeed(0)
        );
        this.progressVip.setPercent(Math.round(vipMgr.getVpoint() * 100 / vipMgr.getVpointNeed(0)));
        this.description.setString(StringUtility.replaceAll(
            LocalizedString.to("VIP_STARTER"),
            "@number",
            vipMgr.getVpointNeed(0) - vipMgr.getVpoint()
        ));
    },

    onButtonRelease: function (button, id) {
        switch (id) {
            case VipScene.BTN_CHEAT:
                var status = Math.round(Math.abs(this.pCheat.x - cc.winSize.width) / this.pCheat.width + 1);
                this.pCheat.x = cc.winSize.width - (status % 2) * this.pCheat.width;
                break;
            case VipScene.BTN_CHEAT_OLD:
                var cheatOld = new CmdSendCheatOldVip();
                cheatOld.putData(
                    this.pOldCheat.level.getString() || 0,
                    this.pOldCheat.gstar.getString() || 0,
                    parseFloat(this.pOldCheat.remainTime.getString() || 0) * 1000
                );
                GameClient.getInstance().sendPacket(cheatOld);
                break;
            case VipScene.BTN_CHEAT_NEW:
                var cheatNew = new CmdSendCheatNewVip();
                cheatNew.putData(
                    this.pNewCheat.level.getString() || 0,
                    this.pNewCheat.vPoint.getString() || 0,
                    parseFloat(this.pNewCheat.remainTime.getString() || 0) * 1000
                );
                GameClient.getInstance().sendPacket(cheatNew);
                break;
            case VipStarter.BTN_CLOSE:
                this.onClose();
                break;
            case VipStarter.BTN_GO:
                paymentMgr.openShop();
                this.onClose();
                break;
        }
    }
});
VipStarter.className = "VipStarter";
VipStarter.BTN_CLOSE = 0;
VipStarter.BTN_GO = 1;

var VipHelpNode = cc.Class.extend({
    ctor: function (parent, position) {
        this.helpNode = ccs.load("VipHelpNode.json").node;
        this.helpNode.setPosition(position);
        parent.addChild(this.helpNode);

        this.helpBg = this.helpNode.getChildByName("bg");

        this.helpBtn = this.helpNode.getChildByName("btn");
        this.helpBtn.setPressedActionEnabled(true);
        this.helpBtn.addTouchEventListener(function (sender, type) {
            switch (type) {
                case ccui.Widget.TOUCH_ENDED:
                    var efxTime = 0.125;
                    var delayTime = 2.5;
                    this.helpBg.stopAllActions();
                    this.turningOff = false;
                    this.helpBg.runAction(cc.sequence(
                        cc.spawn(
                            cc.fadeIn(efxTime * 0.5),
                            cc.scaleTo(efxTime, 1).easing(cc.easeOut(2.5))
                        ),
                        cc.delayTime(delayTime),
                        cc.callFunc(function () {
                            this.turningOff = true;
                        }.bind(this)),
                        cc.spawn(
                            cc.scaleTo(efxTime, 0).easing(cc.easeIn(2.5)),
                            cc.fadeOut(efxTime)
                        )
                    ))
                    break;
            }
        }.bind(this));
    },

    turnOff: function () {
        if (this.turningOff) return;
        this.turningOff = true;
        var efxTime = 0.125;
        this.helpBg.stopAllActions();
        this.helpBg.runAction(cc.spawn(
            cc.scaleTo(efxTime, 0).easing(cc.easeIn(2.5)),
            cc.fadeOut(efxTime)
        ));
    },

    reset: function () {
        this.turningOff = true;
        this.helpBg.stopAllActions();
        this.helpBg.setScale(0);
    }
});

var VipTooltipLobby = cc.Node.extend({
    ctor: function () {
        this._super();
        this._layout = ccs.load("VipTooltipLobby.json").node;
        this.addChild(this._layout);

        this.panel = this._layout.getChildByName("panel");
        this.bg = this.panel.getChildByName("bgTooltip");
        this.txtRemain = this.panel.getChildByName("txtRemain");
        this.txtTimeRemain = this.panel.getChildByName("txtTimeRemain");
        this.txtTimeExpired = this.panel.getChildByName("txtTimeExpired");
    },

    onEnterLobby: function () {
        var efxTime = 0.25;
        this.panel.stopAllActions();
        this.panel.setOpacity(0);
        this.panel.setScale(0);
        this.panel.setRotation(-90);
        this.panel.runAction(cc.sequence(
            cc.delayTime(5),
            cc.spawn(
                cc.scaleTo(efxTime, 1).easing(cc.easeBackOut()),
                cc.fadeIn(efxTime).easing(cc.easeIn(2.5)),
                cc.rotateTo(efxTime, 0).easing(cc.easeBackOut())
            ),
            cc.delayTime(5),
            cc.spawn(
                cc.scaleTo(efxTime, 0).easing(cc.easeBackIn()),
                cc.fadeOut(efxTime).easing(cc.easeOut(2.5)),
                cc.rotateTo(efxTime, -90).easing(cc.easeBackIn())
            )
        ).repeatForever());

        if (vipMgr.getVipLevel() > 0) {
            this.setVisible(true);
            this.schedule(this.setInfo, 1);
        } else {
            this.setVisible(false);
        }
    },

    setInfo: function () {
        vipMgr.updateTimeVip(1);
        var remainTime = vipMgr.getRemainTime();
        if (remainTime <= 0) {
            this.bg.setScale(0.68);
            this.txtRemain.setVisible(false);
            this.txtTimeRemain.setVisible(false);
            this.txtTimeExpired.setVisible(true);
        } else {
            this.bg.setScale(1);
            this.txtRemain.setVisible(true);
            this.txtTimeRemain.setVisible(true);
            this.txtTimeExpired.setVisible(false);

            this.txtTimeRemain.setString(VipManager.getRemainTimeString(remainTime));
        }
    }
});