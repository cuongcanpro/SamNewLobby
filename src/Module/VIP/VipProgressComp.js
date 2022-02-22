var VipProgressComp = BaseLayer.extend({
    ctor: function () {
        this._super();
        this.initWithBinaryFile("VipProgressComp.json");
    },

    initGUI: function () {
        VipProgressComp.componentInitGUI(this, this);
        this.enableFog();
    },

    onEnterFinish: function () {
        this.bg.setPosition(this.bg.defaultPos);
    },

    effectIn: function () {
        this.bg.setPosition(cc.p(this.bg.x, - this.bg.height * 0.5));
        this.bg.runAction(cc.moveTo(0.25, this.bg.defaultPos).easing(cc.easeBackOut()));
        this._fog.runAction(cc.fadeTo(0.25, 205));
        VipProgressComp.blinkingEffect(this);
    },

    onClose: function () {
        this.bg.runAction(cc.sequence(
            cc.moveTo(0.25, cc.p(this.bg.x, - this.bg.height * 0.5)).easing(cc.easeBackIn()),
            cc.callFunc(this.onCloseDone.bind(this))
        ));
        this._fog.runAction(cc.fadeTo(0.25, 0));
    },

    setCloseTime: function (time) {
        this.stopAllActions();
        this.runAction(cc.sequence(
            cc.delayTime(time),
            cc.callFunc(this.onClose.bind(this))
        ));
    },
});
VipProgressComp.className = "VipProgressComp";
VipProgressComp.TAG = 730;

VipProgressComp.componentInitGUI = function (object, gui) {
    if (!object) return;
    if (!object._layout) object._layout = object;
    object.bg = gui.getControl("bg", object._layout);

    object.progressVip = gui.getControl("progressVip", object.bg);
    object.lbProgress = gui.getControl("lbProgress", object.progressVip);
    object.imgVpoint = gui.getControl("imgVpoint", object.progressVip);
    if (object.imgVpoint)
        object.imgVpoint.worldPos = object.imgVpoint.getParent().convertToWorldSpace(object.imgVpoint);

    object.iconCurVip = gui.getControl("iconCurVip", object.bg);
    if (object.iconCurVip) {
        object.iconCurVip.ignoreContentAdaptWithSize(true);
        object.iconCurVip.worldPos = object.iconCurVip.getParent().convertToWorldSpace(object.iconCurVip);
    }
    object.iconNextVip = gui.getControl("iconNextVip", object.bg);
    if (object.iconNextVip) {
        object.iconNextVip.ignoreContentAdaptWithSize(true);
    }
    object.iconEfxVip = gui.getControl("iconEfxVip", object.bg);
    if (object.iconEfxVip) {
        object.iconEfxVip.ignoreContentAdaptWithSize(true);
        object.iconEfxVip.setVisible(false);
    }

    object.lbVip = gui.getControl("lbVip");
    object.lbRemainTime = gui.getControl("lbRemainTime", object.bg);

    object.pDecor = gui.getControl("pDecor", object.bg);
    object.arrayDot = [];
    var padX = 22;
    var startX = 45;
    var startY = 12;
    for (var i = 0; i < 34; i++) {
        if (i < 12) {
            object.arrayDot[i] = new ccui.ImageView("Lobby/Common/dotNormal.png");
            object.arrayDot[i].setPosition(startX + padX * i, startY);
            object.pDecor.addChild(object.arrayDot[i]);
        } else if (i > 16 && i < 29) {
            object.arrayDot[i] = new ccui.ImageView("Lobby/Common/dotNormal.png");
            object.arrayDot[i].setPosition(startX + padX * (28 - i), startY + 71);
            object.pDecor.addChild(object.arrayDot[i]);
        } else {
            object.arrayDot[i] = gui.getControl("dot" + i, object.pDecor);
        }
    }
}

VipProgressComp.setInfoGUI = function (progressComp) {
    progressComp.info = {
        vPoint: 124,
        vipLevel: 5,
        remainTime: 12345,
        vPointNext: VipManager.getInstance().getVpointNeed(5)
    };
}

VipProgressComp.getProgressComp = function (progressComp) {
    var isNew = false;

    if (!progressComp) {
        var currentScreen = sceneMgr.getMainLayer();
        progressComp = currentScreen.getControl("vipProgressComp");
        VipProgressComp.componentInitGUI(progressComp, currentScreen);
    }

    if (!progressComp) {
        progressComp = sceneMgr.getGUI(VipProgressComp.TAG);
    }

    if (!progressComp) {
        progressComp = sceneMgr.openGUI(VipProgressComp.className, undefined, VipProgressComp.TAG, false);
        isNew = true;
    }

    return {
        isNew: isNew,
        progressComp: progressComp
    };
};

VipProgressComp.iconVpoint = function () {
    var vPointIcon = new cc.Sprite(VipManager.getIconVpoint());
    vPointIcon.actMoving = cc.scaleTo(EffectMgr.RECEIVED_TIME_MOVE, 1).easing(cc.easeOut(2));
    return vPointIcon;
};

VipProgressComp.effectVpoint = function (progressComp, pStart, quantity, delay) {
    var getProgressComp = VipProgressComp.getProgressComp(progressComp);
    var isNew = getProgressComp.isNew;
    progressComp = getProgressComp.progressComp;

    if (!pStart) pStart = cc.p(cc.winSize.width / 2, cc.winSize.height / 2);
    var pEnd = progressComp.imgVpoint.worldPos;
    var time = effectMgr.receivedEffect(
        sceneMgr.layerSystem,
        VipProgressComp.iconVpoint,
        quantity,
        pStart,
        pEnd,
        delay || 0
    );

    effectMgr.runNumberLabelEffect(progressComp.lbProgress, 0, 1000, delay);
    effectMgr.runProgressBarEffect(progressComp.progressVip, 0, 1000, delay);

    if (progressComp instanceof VipProgressComp) {
        if (isNew) progressComp.effectIn();
        progressComp.setCloseTime(time + 1);
    }
};

VipProgressComp.iconHour = function () {
    var iconHour = new cc.Sprite(VipManager.getIconHour());
    return iconHour;
};

VipProgressComp.effectHour = function (progressComp, pStart, quantity, delay) {
    var getProgressComp = VipProgressComp.getProgressComp(progressComp);
    var isNew = getProgressComp.isNew;
    progressComp = getProgressComp.progressComp;

    if (!pStart) pStart = cc.p(cc.winSize.width / 2, cc.winSize.height / 2);
    var pEnd = progressComp.iconCurVip.worldPos;
    var time = effectMgr.receivedEffect(
        sceneMgr.layerSystem,
        VipProgressComp.iconHour,
        quantity,
        pStart,
        pEnd,
        delay || 0
    );
    effectMgr.runNumberLabelEffect(progressComp.lbRemainTime, 0, 1000, delay);

    if (progressComp instanceof VipProgressComp) {
        if (isNew) progressComp.effectIn();
        progressComp.setCloseTime(time + 1);
    }
}

VipProgressComp.effectLevelUp = function (progressComp, cur, des, delay) {
    var getProgressComp = VipProgressComp.getProgressComp(progressComp);
    var isNew = getProgressComp.isNew;
    progressComp = getProgressComp.progressComp;

    var effectTime = 0.25;
    var waitTime = 0.5;
    var changeTime = 0.25;
    var jumpTime = 1;
    progressComp.iconCurVip.loadTexture(VipManager.getIconVip(cur));

    var times = Math.round(des - cur);
    progressComp.iconEfxVip.loadTexture(VipManager.getIconVip(cur + 1));
    progressComp.iconEfxVip.setOpacity(0);
    progressComp.iconEfxVip.setVisible(true);
    progressComp.iconEfxVip.setScale(1.5);
    progressComp.iconEfxVip.setPosition(progressComp.iconNextVip.getPosition());
    progressComp.iconEfxVip.runAction(cc.sequence(
        cc.delayTime(delay),
        cc.sequence(
            cc.show(),
            cc.fadeOut(0),
            cc.scaleTo(0, 1.5),
            cc.spawn(
                cc.scaleTo(effectTime, 1).easing(cc.easeIn(5)),
                cc.fadeIn(effectTime).easing(cc.easeOut(2))
            ),
            cc.delayTime(waitTime * 0.5),
            cc.hide(),
            cc.callFunc(function () {
                cur++;
                if (cur > VipScene.TOTAL_VIP - 1) return;
                progressComp.iconNextVip.loadTexture(VipManager.getIconVip(cur));

                if (cur < VipScene.TOTAL_VIP - 1 && cur < des) {
                    progressComp.iconNextVip.stopAllActions();
                    progressComp.iconNextVip.setRotation3D(vec3(0, 0, 0));
                    progressComp.iconNextVip.runAction(cc.sequence(
                        cc.rotateTo(changeTime * 0.5, vec3(0, 90, 0)).easing(cc.easeBackIn()),
                        cc.callFunc(function () {
                            progressComp.iconNextVip.loadTexture(VipManager.getDisableIconVip(cur + 1));
                        }),
                        cc.rotateTo(changeTime * 0.5, vec3(0, 0, 0)).easing(cc.easeBackIn())
                    ));
                    progressComp.iconEfxVip.loadTexture(VipManager.getIconVip(cur + 1));
                }
            }),
            cc.delayTime(changeTime + waitTime * 0.5)
        ).repeat(Math.round(times)),
        cc.show(),
        cc.callFunc(function () {
            if (cur < VipScene.TOTAL_VIP - 1) {
                progressComp.iconNextVip.loadTexture(VipManager.getDisableIconVip(cur + 1));
            }
        }),
        cc.jumpTo(jumpTime, progressComp.iconCurVip.defaultPos, 50, 1).easing(cc.easeInOut(2))
    ));

    progressComp.iconNextVip.loadTexture(VipManager.getDisableIconVip(cur + 1));


    if (progressComp instanceof VipProgressComp) {
        if (isNew) progressComp.effectIn();
        progressComp.setCloseTime(delay + (effectTime + changeTime + waitTime) * (des - cur) + jumpTime + 1);
    }
}

VipProgressComp.blinkingEffect = function (progressComp) {
    progressComp = VipProgressComp.getProgressComp(progressComp).progressComp;
    var count = 0;
    var controller = 3;
    progressComp.runAction(cc.sequence(
        cc.delayTime(0.15),
        cc.callFunc(function () {
            count++;
            for (var i = 0; i < progressComp.arrayDot.length; i++) {
                if ((i + count) % controller === 0) {
                    progressComp.arrayDot[i].loadTexture("Lobby/Common/dotNormal.png");
                    progressComp.arrayDot[i].setOpacity(255);
                } else {
                    progressComp.arrayDot[i].loadTexture("Lobby/Common/dotLight.png");
                    progressComp.arrayDot[i].setOpacity(255 * ((i + count) % controller) / controller);
                }
            }
        })
    ).repeatForever());
}
