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
            var img = this.customButton("vip_" + i, VipScene.BTN_VIP, this.listVip);
            img.setCascadeOpacityEnabled(false);
            img.setOpacity(0);
            img.setSwallowTouches(false);
            img.vipId = i;
            var effect = db.DBCCFactory.getInstance().buildArmatureNode("Gem");
            effect.setPosition(cc.p(img.width / 2, img.height / 2));
            effect.defaultPos = effect.getPosition();
            if (i > 0) {
                effect.gotoAndPlay("lv" + i + "_1", -1, -1, 0);
            } else {
                effect.setVisible(false);
            }
            img.addChild(effect);
            img.effect = effect;
            img.lock = new ccui.ImageView("res/Lobby/GUIVipNew/lock.png");
            img.lock.setPosition(cc.p(effect.width / 2 - 55, effect.height / 2 - 55));
            img.lock.setScale(0.75);
            effect.addChild(img.lock);
            this.listImg.push(img);
        }
        this.btnClose = this.customButton("btnClose", VipScene.BTN_BACK);

        this.benefit = new VipBenefitNode();
        this.benefit.setPosition(cc.p(cc.winSize.width / 2, 130));
        this.addChild(this.benefit);

        this.bgVipProgress = this.getControl("bgProgress", this.listVip);
        this.bgVipProgress.width = this.listVip.width + VipScene.PROGRESS_BG_OFFSET * 2;
        this.bgVipProgress.x = - VipScene.PROGRESS_BG_OFFSET;
        this.vipProgress = this.getControl("progress", this.bgVipProgress);
        this.vipProgress.width = this.bgVipProgress.width - VipScene.PROGRESS_OFFSET * 2;

        this.lbVip = this.getControl("lbVip");
        this.setCascadeOpacityEnabled(false);
        this.lbVip.efx = this.getControl("efx", this.lbVip);
        this.lbVip.efx.setVisible(false);

        this.touched = null;
        this.moved = false;
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
            onTouchBegan: function(touch, event){
                self.moved = false;
                self.touched = touch.getLocation();
                return true;
            },
            onTouchMoved: function(touch, event) {
                var delta = touch.getDelta();
                if (self.touched && Math.abs(self.touched.x - touch.getLocation().x) > 25) {
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
            onTouchEnded: function(touch, event){
                if (!self.moved) return;
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
        this.touched = null;
        this.normalizeAllVip();

        this.setInfo();
        this.scheduleUpdate();
    },

    setInfo: function () {
        var vipLevel = vipMgr.getVipLevel();
        var currentVPoint = vipMgr.getVpoint();
        var targetVPoint = vipMgr.getVpointNeed(vipLevel + 1);
        cc.log("SET INFO FOR NEW VIP SCENE", vipLevel, currentVPoint, targetVPoint);

        this.snapToNearestVip(vipLevel);

        for (var i = 0; i < this.listImg.length; i++) {
            this.listImg[i].lock.setVisible(i > vipLevel);
        }
        var posVPoint = this.listImg[vipLevel].defaultPos.x;
        posVPoint += this.listVip.width * 0.1 * (currentVPoint / targetVPoint);
        this.vipProgress.width = posVPoint + (VipScene.PROGRESS_BG_OFFSET - VipScene.PROGRESS_OFFSET) * 2;
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
                this.listImg[i].effect.setVisible(false);
            }
        }

        this.movingImage();
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
                this.listImg[i].effect.setOpacity(opacity + ratio * (255 - opacity));
            } else {
                this.listImg[i].effect.setColor(color);
                this.listImg[i].effect.setOpacity(opacity);
            }
        }
    },

    changeLabelVip: function (up, closest) {
        this.lbVip.efx.setString(this.lbVip.getString());
        this.lbVip.setString(VipScene.NAME[closest]);

        var effectTime = 0.25;
        var opp = up? 1 : -1;
        this.lbVip.stopAllActions();
        this.lbVip.setOpacity(0);
        this.lbVip.setPosition(cc.p(
            this.lbVip.defaultPos.x,
            this.lbVip.defaultPos.y + opp * this.lbVip.height
        ));
        this.lbVip.runAction(cc.spawn(
            cc.fadeIn(effectTime).easing(cc.easeOut(2)),
            cc.moveTo(effectTime, this.lbVip.defaultPos).easing(cc.easeBackOut(2))
        ));

        this.lbVip.efx.stopAllActions();
        this.lbVip.efx.setVisible(true);
        this.lbVip.efx.setOpacity(255);
        this.lbVip.efx.setPosition(cc.p(
            this.lbVip.efx.defaultPos.x,
            this.lbVip.efx.defaultPos.y - opp * this.lbVip.height
        ));
        this.lbVip.efx.runAction(cc.sequence(
            cc.fadeOut(effectTime).easing(cc.easeOut(2)),
            cc.hide()
        ));
    },

    snapToNearestVip: function (closest) {
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

        var effectTime = 0.25;
        var effect = this.listImg[closest].effect;
        effect.stopAllActions();
        effect.runAction(cc.spawn(
            cc.scaleTo(effectTime, 1.5).easing(cc.easeBackOut()),
            cc.tintTo(effectTime, cc.color("#ffffff")),
            cc.fadeIn(effectTime),
            cc.moveTo(effectTime, effect.defaultPos).easing(cc.easeBackOut())
        ));
        effect.setScale(0);
        if (closest > 0) {
            effect.gotoAndPlay("lv" + closest + "_0", -1, -1, 1);
            effect.setCompleteListener(function () {
                this.gotoAndPlay("lv" + closest + "_1", -1, -1, 0);
            }.bind(effect));
        }

        for (var i = 0; i < this.listImg.length; i++) {
            if (i !== closest) {
                this.listImg[i].stopAllActions();
                this.listImg[i].runAction(
                    cc.scaleTo(effectTime, 1).easing(cc.easeBackOut())
                );
                this.listImg[i].effect.runAction(
                    cc.tintTo(effectTime, VipScene.TINT_COLOR).easing(cc.easeBackOut())
                );
            }
        }
        this.benefit.setBenefit(closest);
        this.benefit.updatePosition(effectTime);

        if (closest !== this.closest) this.changeLabelVip(closest > this.closest, closest);
        this.closest = closest;
    },

    update: function (dt) {
        this.benefit.update(dt);
    },

    onButtonRelease: function (button, id) {
        cc.log("VIP SCENE CLICK BUTTON", id);
        switch (id) {
            case VipScene.BTN_BACK:
                this.onBack();
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
                VipProgressComp.effectVpoint(null, null, 15);
                VipProgressComp.effectHour(null, null, 15, 1);
                break;
            case VipScene.BTN_CHEAT_LEVEL:
                VipManager.showUpLevelVip(5, 7);
                break;
            case VipScene.BTN_CHEAT_PROGRESS_LEVEL:
                VipProgressComp.effectLevelUp(null, 1, 5, 1);
                VipProgressComp.blinkingEffect();
                break;
            case VipScene.BTN_CHEAT_RECEIVED:
                sceneMgr.openGUI(ReceivedGUI.className);
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

VipScene.NAME = [
    "Free",
    "Bronze",
    "Silver",
    "Gold",
    "Quartz",
    "Sapphire",
    "Garnet",
    "Emerald",
    "Topaz",
    "Amethyst",
    "Ruby"
];

VipScene.TINT_COLOR = cc.color("#427194");

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

        this.list = [];

        this.enableFog();
    },

    onEnterFinish: function () {
        this.setShowHideAnimate(this.bg);

        this.defaultCamera = cc.Camera.getDefaultCamera();
        this.defaultCamera.initOrthographic(cc.winSize.width, cc.winSize.height, 1, 5000);
        this.defaultCamera.setPosition(cc.p(0, 0));

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
                    (i + 0.5) * VipBenefitCell.WIDTH + i * VipBenefitNode.MARGIN_CELL * 2,
                    this.scrollView.height / 2
                ));
                this.scrollView.addChild(cell);
                this.list.push(cell);
            } else {
                cell = this.list[i];
            }
            cell.setInfo(listBenefit[i], false, VipManager.NUMBER_VIP);
            cell.btn.setVisible(false);
            cell.maxStamp.setVisible(true);
        }

        this.scrollView.innerWidth = listBenefit.length * VipBenefitCell.WIDTH
            + (listBenefit.length - 1) * VipBenefitNode.MARGIN_CELL * 2;
        this.scrollView.setScrollBarEnabled(false);

        this.lbProgress.setString(
            vipMgr.getVpoint() + "/" + vipMgr.getVpointNeed(1)
        );
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
                this.onClose();
                break;
        }
    }
});
VipStarter.className = "VipStarter";
VipStarter.BTN_CLOSE = 0;
VipStarter.BTN_GO = 1;