/**
 * Created by CPU60109_LOCAL on 1/30/2018.
 */
var JackpotGUI = BaseLayer.extend({
    ctor: function () {
        this._super(JackpotGUI.className);
        this.initWithBinaryFile("JackpotGUI.json");
    },

    customizeGUI: function () {
        this.bg = this.getControl("bg", this._layout);
        this.customButton("btnQuit", ChooseRoomScene.BTN_QUIT, this.bg);
        var jpTitle = this.getControl("jptitle", this.bg);
        this.createAnim(jpTitle, "JackpotLogo");
        jpTitle.anim.getAnimation().gotoAndPlay("1", -1);
        this.setFog(true);
    },

    onEnterFinish: function () {
        this.onUpdateGUI();
        this.setShowHideAnimate(this.bg, true);
    },

    createAnim: function (control, anim) {
        cc.log(anim);
        if (control === undefined || control == null || anim === undefined || anim == "") return null;

        if (control.anim) {
            control.removeChild(control.anim);
            control.anim = null;
        }

        var eff = db.DBCCFactory.getInstance().buildArmatureNode(anim);
        if (eff) {
            control.addChild(eff);
            eff.setPosition(control.getContentSize().width / 2, control.getContentSize().height / 2);
            control.anim = eff;
        }
        return eff;
    },

    onUpdateGUI: function (data) {
        var jackpot = gamedata.jackpot[0][gamedata.selectedChanel];
        var diamond = gamedata.jackpot[1][gamedata.selectedChanel];
        this.setJackpotTotalUI(jackpot);
        this.setDiamondUI(diamond);
        this.setChannel(gamedata.selectedChanel);
        this.setTextGUI(gamedata.selectedChanel);
    },

    setJackpotTotalUI: function (jackpot) {
        var bg = this.getControl("bg", this._layout);
        var listDola = bg.getChildByTag(JackpotGUI.TAG_DOLA);
        var listDigits = bg.getChildByTag(JackpotGUI.TAG_DIGITS);
        var listDots = bg.getChildByTag(JackpotGUI.TAG_DOT);
        for (var i = 0; i < listDola.getChildrenCount(); i++) {
            listDola.getChildren()[i].setVisible(true);
        }
        for (var i = 0; i < listDigits.getChildrenCount(); i++) {
            listDigits.getChildren()[i].setVisible(false);
            listDigits.getChildren()[i].stopAllActions();
        }
        for (i = 0; i < listDots.getChildrenCount(); i++) {
            listDots.getChildren()[i].setVisible(false);
        }
        var n = 0;
        while (jackpot > 0) {
            var d = jackpot % 10;
            var digit = listDigits.getChildByName("d" + (n + 1).toString());
            var dola = listDola.getChildByName("dola" + (n).toString());
            if (!cc.sys.isNative) {
                digit.setAnchorPoint(0.35, 0.5);
            }
            dola.runAction(new cc.Sequence(cc.delayTime(0.0 * n), new cc.CallFunc(function () {
                this.setVisible(false);
            }, dola)));
            digit.g = d;
            digit.n = n;
            digit.runAction(new cc.Sequence(new cc.DelayTime(0.0 * n), new cc.CallFunc(function () {
                this.setVisible(true);
                var l = Math.floor(Math.random() * 10);
                var count = 0;
                this.y = 1;
                this.yy = 1;
                this.runAction(new cc.Sequence(cc.delayTime(0.07), new cc.CallFunc(function () {
                    if (count <= 10 + this.n * 3) {
                        this.setString((l % 10).toString());
                        this.y = 1;
                        this.runAction(new cc.Sequence(new cc.Spawn(new cc.ScaleTo(0, 1, 0.15), new cc.MoveTo(0, this.x, this.yy + 24))
                            , new cc.Spawn(new cc.ScaleTo(0.02, 1, 1), new cc.MoveTo(0.025, this.x, this.yy + 3))
                            , new cc.Spawn(new cc.ScaleTo(0.01, 1, 1), new cc.MoveTo(0.025, this.x, this.yy - 3))
                            , new cc.Spawn(new cc.ScaleTo(0.02, 1, 0.25), new cc.MoveTo(0.025, this.x, this.yy - 16))));
                    } else {
                        this.setString(this.g.toString());
                        this.stopAllActions();
                        this.setScale(1, 1);
                        this.y = 1;
                    }
                    l += 1;
                    count += 1;
                }, this)).repeatForever());
            }, digit)));
            if (n > 0 && n % 3 == 0) {
                listDots.getChildByName("dot" + (n / 3).toString()).setVisible(true);
            }
            n += 1;
            jackpot = Math.floor(jackpot / 10);
        }
    },

    setDiamondUI: function (diamond) {
        var bg = this.getControl("bg", this._layout);
        var config = CommonLogic.getJackpotConfig(gamedata.selectedChanel);
        var listDiamond = bg.getChildByTag(JackpotGUI.TAG_DIAMOND);
        for (var i = 0; i < listDiamond.getChildrenCount(); i++) {
            listDiamond.getChildren()[i].loadTexture(config.popup_diamond);
            listDiamond.getChildren()[i].setVisible(false);
        }
        for (i = 0; i < diamond; i++) {
            listDiamond.getChildren()[i].setVisible(true);
        }
    },

    setChannel: function (channel) {
        var bg = this.getControl("bg", this._layout);
        var channelGui = this.getControl("channel", bg);
        var config = CommonLogic.getJackpotConfig(channel);
        channelGui.loadTexture(config.channel);
    },

    setTextGUI: function () {
        var bg = this.getControl("bg", this._layout);
        var listText = bg.getChildByTag(JackpotGUI.TAG_TEXT);
        var config = CommonLogic.getJackpotConfig(gamedata.selectedChanel);
        var text1 = listText.getChildByName("textNgoc1");
        text1.setString(config.text);
        text1.setColor(cc.hexToColor(config.color));
        var text2 = listText.getChildByName("textNgoc2");
        text2.setString(config.text);
        text2.setColor(cc.hexToColor(config.color));
        text2.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
    },

    onButtonRelease: function (button, id) {
        switch (id) {
            case JackpotGUI.BUTTON_QUIT:
            {
                this.onBack();
                break;
            }
        }
    },

    onBack: function () {
        this.onClose();
    }
});

JackpotGUI.className = "JackpotGUI";

JackpotGUI.BUTTON_QUIT = 1;

JackpotGUI.TAG_TEXT = 441;
JackpotGUI.TAG_DIGITS = 184;
JackpotGUI.TAG_DOT = 200;
JackpotGUI.TAG_DIAMOND = 164;
JackpotGUI.TAG_DOLA = 521;

var UPDATING_JACKPOT = false;
var JackpotWinGUI = BaseLayer.extend({
    ctor: function () {
        this._super(JackpotWinGUI.className);
        this.initWithBinaryFile("JackpotWin.json");
    },

    customizeGUI: function () {
        this.customizeButton("btnQuit", ChooseRoomScene.BTN_QUIT);
        this.win = this.getControl("Win");
        this.congrat = this.getControl("Congratulation", this.win);
        this.congrat.setLocalZOrder(1000);
        this.noti = this.getControl("Noti", this.win);
        this.noti.setLocalZOrder(1000);

        this.diamondShine = this.getControl("diamondNode");
    },

    onEnterFinish: function () {
        this.setVisible(false);
        this.congrat.setVisible(true);
        this.congrat.setOpacity(255);
        this.noti.setVisible(true);
        this.noti.setOpacity(255);
        this.createAnim(this.diamondShine, "Diamond");
        this.diamondShine.anim.setScale(1.5);
        this.diamondShine.anim.setLocalZOrder(1);
        this.diamondShine.anim.setCompleteListener(this.effectFlyDiamond.bind(this));
    },

    onUpdateGUI: function () {
        UPDATING_JACKPOT = true;
        this.setFog(true);
        this.runAction(cc.sequence(
            cc.delayTime(0),
            cc.callFunc(function () {
                this.setVisible(true);
                this.setDiamondUI();
                this.setTextGUI();
            }, this)));
    },

    setDiamondUI: function () {
        this.diamondShine.anim.getAnimation().gotoAndPlay((gamedata.selectedChanel + 1).toString(), -1);
    },

    setTextGUI: function (data) {
        if (!data) {
            var text = ccui.Helper.seekWidgetByName(this.noti, "textNgoc");
            var config = CommonLogic.getJackpotConfig(gamedata.selectedChanel);
            text.setString(config.text);
            text.setColor(cc.hexToColor(config.color));
            cc.log(config.color);
        }
    },

    onButtonRelease: function (button, id) {
        cc.log(id);
        switch (id) {
            case JackpotWinGUI.BTN_QUIT:
                this.onClose();
                break;
        }
    },

    effectFlyDiamond: function () {
        var board = sceneMgr.getRunningScene().getMainLayer();
        var listDiamond = ccui.Helper.seekWidgetByName(board._layout, "btnJackpot").getChildByName("listDiamond");
        var myDiamond = gamedata.jackpot[1][gamedata.selectedChanel];
        if (myDiamond === 0) myDiamond = 5;
        var pos = listDiamond.convertToWorldSpace(listDiamond.getChildByName("kc" + (myDiamond).toString()).getPosition());
        pos.x -= this.diamondShine.x;
        pos.y -= this.diamondShine.y;
        var startPos = this.diamondShine.anim.getPosition();

        this.congrat.runAction(cc.fadeOut(0.25));
        this.noti.runAction(cc.fadeOut(0.25));
        this._layerColor.runAction(cc.fadeOut(0.25));
        this.diamondShine.anim.runAction(cc.sequence(
            cc.spawn(
                cc.bezierTo(
                    1,
                    [startPos, cc.p(startPos.x / 2 + pos.x / 2, -pos.y), pos]
                ).easing(cc.easeIn(2)),
                cc.scaleTo(1, 0.2)
            ),
            cc.callFunc(function () {
                UPDATING_JACKPOT = false;
                if (sceneMgr.getRunningScene().getMainLayer().updateJackpotGUI)
                    sceneMgr.getRunningScene().getMainLayer().updateJackpotGUI();
            }),
            cc.delayTime(0.5),
            cc.callFunc(function () {
                this.onClose();
            }, this)
        ));
    },

    createAnim: function (control, anim) {
        cc.log(anim);
        if (control === undefined || control == null || anim === undefined || anim == "") return null;

        if (control.anim) {
            control.removeChild(control.anim);
            control.anim = null;
        }

        var eff = db.DBCCFactory.getInstance().buildArmatureNode(anim);
        if (eff) {
            control.addChild(eff);
            eff.setPosition(control.getContentSize().width / 2, control.getContentSize().height / 2);
            control.anim = eff;
        }
        return eff;
    },

    onBack: function () {
        this.onClose();
    }
});

JackpotWinGUI.className = "JackpotWinGUI";
JackpotWinGUI.TAG_WIN = 278;
JackpotWinGUI.TAG_WIN5 = 277;
JackpotWinGUI.BTN_QUIT = 1;

var JackpotWin5GUI = BaseLayer.extend({
    ctor: function () {
        this.eff = null;
        this._super(JackpotWin5GUI.className);
        this.initWithBinaryFile("JackpotWin5.json");
    },

    onEnterFinish: function () {
        this.setVisible(false);
    },

    customizeGUI: function () {
        var bg = this.getControl("bg", this._layout);
        this.win5 = bg.getChildByTag(JackpotWin5GUI.TAG_WIN5);
        this.win5.setLocalZOrder(1000);
        this.win5.setVisible(false);
        this.customButton("btnQuit", JackpotWin5GUI.BTN_QUIT, bg);
        this.customButton("fshare", JackpotWin5GUI.BTN_SHARE, this.win5);
    }
    ,

    createAnim: function (control, anim) {
        cc.log(anim);
        if (control === undefined || control == null || anim === undefined || anim == "") return null;

        if (control.anim) {
            control.removeChild(control.anim);
            control.anim = null;
        }

        var eff = db.DBCCFactory.getInstance().buildArmatureNode(anim);
        if (eff) {
            control.addChild(eff);
            eff.setPosition(control.getContentSize().width / 2, control.getContentSize().height / 2);
            control.anim = eff;
        }
        return eff;
    },

    onUpdateGUI: function (status, data) {
        if (status == "win5") {// an dc vien thu 5
            this.setFog(true);
            this.runAction(new cc.Sequence(cc.delayTime(3), new cc.CallFunc(function () {
                if (sceneMgr.getRunningScene().getMainLayer().updateJackpotGUI)
                    sceneMgr.getRunningScene().getMainLayer().updateJackpotGUI();
                this.setVisible(true);
                this.getControl("bg", this._layout).setVisible(false);
                this.createAnim(this, "FiveDiamond");
                this.anim.setVisible(true);
                this.anim.gotoAndPlay((gamedata.selectedChanel + 1).toString(), -1);
                this.anim.setCompleteListener(function () {
                    this.anim.setVisible(false);
                    this.win5.setVisible(true);
                    var bg = this.getControl("bg", this._layout);
                    bg.setVisible(true);
                    this.createAnim(bg, "Jackpot");
                    bg.anim.getAnimation().gotoAndPlay("1", -1);
                    this.setChannel(gamedata.selectedChanel);
                    this.setJackpotTotalUI(data.jackpot);
                    this.runAction(new cc.Sequence(cc.delayTime(1), new cc.CallFunc(function () {
                        effectMgr.dropCoinEffect(this, 200, cc.p(cc.winSize.width / 2, cc.winSize.height / 3));
                    }, this)));
                }.bind(this));

            }, this)));

        }
    },
    setChannel: function (channel) {
        var bg = this.getControl("bg", this._layout);
        var config = CommonLogic.getJackpotConfig(channel);
        var channelGUI = this.getControl("channel", this.win5);
        channelGUI.loadTexture(config.channel);
    },
    setJackpotTotalUI: function (jackpot) {
        var bg = this.getControl("bg", this._layout);
        var jackpotGUI = this.getControl("jackpot", this.win5);
        jackpotGUI.setString("$" + StringUtility.standartNumber(jackpot.toString()));
    },
    onButtonRelease: function (button, id) {
        cc.log(id);
        switch (id) {
            case JackpotWin5GUI.BTN_QUIT:
            {
                this.onClose();
                break;
            }
            case JackpotWin5GUI.BTN_SHARE:
            {
                if (!gamedata.checkOldNativeVersion()) {
                    var imgPath = sceneMgr.takeScreenShot();
                    setTimeout(function () {
                        fr.facebook.shareScreenShoot(imgPath, function (result) {
                            var message = "";
                            if (result == -1) {
                                message = localized("INSTALL_FACEBOOK");
                            }
                            else if (result == 1) {
                                message = localized("NOT_SHARE");
                            }
                            else if (result == 0) {
                                message = localized("FACEBOOK_DELAY");
                                GameLayer.sharedPhoto = true;
                            }
                            else {
                                message = localized("FACEBOOK_ERROR");
                            }
                            Toast.makeToast(Toast.SHORT, message);
                        });
                    }, 500);
                } else {
                    this.onShareImg = function (social, jdata) {
                        var message = "";
                        var dom = JSON.parse(jdata);
                        if (dom["error"] == -1) {
                            message = localized("INSTALL_FACEBOOK");
                        }
                        else if (dom["error"] == 1) {
                            message = localized("NOT_SHARE");
                        }
                        else if (dom["error"] == 0) {
                            message = localized("FACEBOOK_DELAY");
                            GameLayer.sharedPhoto = true;

                        }
                        else {
                            message = localized("FACEBOOK_ERROR");
                        }
                        Toast.makeToast(2.5, message);

                    };

                    socialMgr.set(this, this.onShareImg);
                    socialMgr.shareImage(socialMgr._currentSocial);
                }

                break;
            }
        }
    },

    onBack: function () {
        this.onClose();
    }
});

JackpotWin5GUI.className = "JackpotWin5GUI";

JackpotWin5GUI.TAG_WIN = 278;
JackpotWin5GUI.TAG_WIN5 = 184;

JackpotWin5GUI.BTN_QUIT = 10000;
JackpotWin5GUI.BTN_SHARE = 10001;

var JackpotInBoardGUI = BaseLayer.extend({
    ctor: function () {
        this._super(JackpotInBoardGUI.className);
        this.initWithBinaryFile("JackpotInBoardGUI.json");
    },

    onEnterFinish: function () {
        //this.onUpdateGUI();
        //this.setFog(true);
    },

    customizeGUI: function () {
    }
    ,

    createAnim: function (control, anim) {
        cc.log(anim);
        if (control === undefined || control == null || anim === undefined || anim == "") return null;

        if (control.anim) {
            control.removeChild(control.anim);
            control.anim = null;
        }

        var eff = db.DBCCFactory.getInstance().buildArmatureNode(anim);
        if (eff) {
            control.addChild(eff);
            eff.setPosition(control.getContentSize().width / 2, control.getContentSize().height / 2);
            control.anim = eff;
        }
        return eff;
    },

    onUpdateGUI: function (data) {
        this.runAction(new cc.Sequence(cc.delayTime(3), new cc.CallFunc(function () {
            if (sceneMgr.getRunningScene().getMainLayer().updateJackpotGUI)
                sceneMgr.getRunningScene().getMainLayer().updateJackpotGUI();
            var localChair = gamedata.gameLogic.convertChair(data.chair);
            var gameBoard = sceneMgr.getRunningScene().getMainLayer();
            var playerPanel = null;
            if (gameBoard instanceof BoardScene) {
                playerPanel = ccui.Helper.seekWidgetByName(gameBoard._layout, "panel" + localChair.toString());
            }
            cc.log("local chair", localChair);
            var node = this._layout.getChildByTag(190);
            var jp = ccui.Helper.seekWidgetByName(node, localChair.toString());
            if (playerPanel) {
                var icon = playerPanel.getChildByName("btn");
                var deltaPosY = icon.getContentSize().height / 4;
                var wPos = playerPanel.convertToWorldSpace(icon.getPosition());
                var nPos = node.convertToNodeSpace(wPos);
                nPos.y += deltaPosY;
                jp.setPosition(nPos);
            }
            this.createAnim(jp, "GetJackpot");
            jp.anim.getAnimation().gotoAndPlay((gamedata.selectedChanel + 1).toString());
            var jptotal = ccui.Helper.seekWidgetByName(jp, "jp" + localChair.toString());
            jptotal.setString("$" + StringUtility.standartNumber(data.jackpot));
            jptotal.setLocalZOrder(1000);
            jp.setVisible(true);
            jp.runAction(new cc.Sequence(cc.delayTime(5), cc.callFunc(function () {
                this.setVisible(false);
            }, jp), cc.callFunc(function () {
                this.onClose();
            }, this)));

        }, this)));
    },

    setJackpotTotalUI: function (jackpot) {
        var jackpotGUI = ccui.Helper.seekWidgetByName(this.win5, "jackpot");
        jackpotGUI.setString("$" + StringUtility.standartNumber(jackpot.toString()));
    },

    onButtonRelease: function (button, id) {
    },

    onBack: function () {
        this.onClose();
    }
});

JackpotInBoardGUI.className = "JackpotInBoardGUI";