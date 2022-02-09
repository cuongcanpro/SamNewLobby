var JackpotMgr = BaseMgr.extend({
    ctor: function () {
        this._super();
        this.jackpotJson = null;
        this.jackpot = [];
        this.hasJackpot = false;
        this.loadJackpotJson();
        this.preloadResource();

    },

    preloadResource: function () {
        db.DBCCFactory.getInstance().loadDragonBonesData("res/Armatures/jackpot/skeleton.xml","jackpot");
        db.DBCCFactory.getInstance().loadTextureAtlas("res/Armatures/jackpot/texture.plist", "jackpot");
    },

    loadJackpotJson: function () {
        var url = "res/Jackpot/jackpot.json";
        if (!cc.sys.isNative) {
            url = srcPath + url;
        }
        cc.loader.loadJson(url, function (error, data) {
            if (!error) {
                this.jackpotJson = data;
            }
        }.bind(this));
    },

    onReceived: function (cmd, pk) {
        switch (cmd) {
            case JackpotMgr.CMD_JACKPOT_INFO:
            {
                var jackpot = new CmdJackpotInfo(pk);
                jackpot.jackpotPacket = true;
                if (!this.jackpot[1] || this.jackpot[1][channelMgr.selectedChanel] != jackpot.diamond[channelMgr.selectedChanel] ||
                    this.jackpot[0][channelMgr.selectedChanel] != jackpot.gold[channelMgr.selectedChanel]) {
                    //cc.log("T log day nay");
                    //cc.log("dddddddddddd", JSON.stringify(gamedata.jackpot));
                    this.jackpot = [jackpot.gold, jackpot.diamond];
                    //cc.log("dddddddddddd", JSON.stringify(gamedata.jackpot));
                    if (board.updateJackpotGUI)
                        board.updateJackpotGUI();
                    var jackpotGui = sceneMgr.getGUI(GameLayer.JACKPOT);
                    if (jackpotGui instanceof JackpotGUI)
                        jackpotGui.onUpdateGUI();
                }
                //cc.log("ddd", gamedata.selectedChanel, jackpot.diamond[gamedata.selectedChanel]);
                jackpot.clean();
                return true;
            }
            case JackpotMgr.CMD_GET_GEM:
            {
                //var jackpot = new CmdGetGem(p);
                this.hasJackpot = true;
                sceneMgr.openGUI(JackpotWinGUI.className, GameLayer.JACKPOT, GameLayer.JACKPOT);
                //jackpot.jackpot = true;
                UPDATING_JACKPOT = true;
                cc.log("jackpotwinpacket");
                var jackpotGui = sceneMgr.getGUI(GameLayer.JACKPOT);
                if (jackpotGui)
                    jackpotGui.onUpdateGUI();
                return true;
            }
            case JackpotMgr.CMD_GET_JACKPOT:
            {
                this.hasJackpot = true;
                var jackpot = new CmdGetJackpot(pk);
                jackpot.jackpotPacket = true;
                if (gamedata.gameLogic && jackpot.chair == gamedata.gameLogic._myChair) {
                    sceneMgr.openGUI(JackpotWin5GUI.className, GameLayer.JACKPOT, GameLayer.JACKPOT);
                    var jackpotGui = sceneMgr.getGUI(GameLayer.JACKPOT);
                    if (jackpotGui)
                        jackpotGui.onUpdateGUI("win5", jackpot);
                } else if (gamedata.gameLogic && jackpot.chair != gamedata.gameLogic._myChair) {
                    sceneMgr.openGUI(JackpotInBoardGUI.className, GameLayer.JACKPOT, GameLayer.JACKPOT);
                    var jackpotGui = sceneMgr.getGUI(GameLayer.JACKPOT);
                    if (jackpotGui)
                        jackpotGui.onUpdateGUI(jackpot);
                }
                jackpot.clean();
                return true;
            }
            case JackpotMgr.CMD_NOTIFY_GET_GEM:
            {
                var text = new CmdNotifyGetGem(pk);
                var config = this.jackpotJson[text.channel];
                if (!this.hasJackpot)
                    Toast.makeToast(Toast.LONG, text.username + " đã nhận được một viên " + config.text);
                this.hasJackpot = false;
                return true;
            }
            case JackpotMgr.CMD_NOTIFY_GET_JACKPOT:
            {
                var text = new CmdNotifyGetJackpot(pk);
                var config = this.jackpotJson[text.channel];
                if (!this.hasJackpot)
                    Toast.makeToast(Toast.LONG, "Chúc mừng người chơi " + text.username + " đã nhận được JACKPOT $" + StringUtility.pointNumber(text.jackpot) + " của kênh " + config.name);
                this.hasJackpot = false;
                return true;
            }

        }
        return false;
    },

    updateButtonJackpot: function (_layout, isInit) {
        if (channelMgr.selectedChanel < 0)
            return;
        var btnjp = ccui.Helper.seekWidgetByName(_layout, "btnJackpot");
        var jackpot = ccui.Helper.seekWidgetByName(btnjp, "jackpot");
        //cc.log("update jackpot now", JSON.stringify(gamedata.jackpot));
        jackpot.setString("$" + StringUtility.standartNumber(this.jackpot[0][channelMgr.selectedChanel]));
        //introJackpot.runAction(cc.FadeOut(0));
        var introJackpot = ccui.Helper.seekWidgetByName(_layout, "introJackpot");
        if (!isInit) {
            return;
        }
        btnjp.stopAllActions();
        if (btnjp.anim != null) {
            btnjp.removeChild(btnjp.anim);
            btnjp.anim = null;
        }
        btnjp.setVisible(false);
        introJackpot.stopAllActions();
        introJackpot.runAction(new cc.FadeIn(0));
        var config = this.jackpotJson[channelMgr.selectedChanel];
        //cc.log("null", introJackpot == null);
        introJackpot.loadTexture(config.intro);
        introJackpot.setVisible(true);
        introJackpot.runAction(new cc.Sequence(cc.delayTime(0.5), new cc.Spawn(new cc.CallFunc(function () {
            jackpotMgr.createAnim(this, "TranDiamond");
            this.anim.gotoAndPlay("1", -1);
        }, introJackpot), new cc.FadeOut(0.9))));
        var btn = ccui.Helper.seekWidgetByName(_layout, "btnJackpot");
        //btn.setVisible(true);
        var listDiamond = ccui.Helper.seekWidgetByName(_layout, "btnJackpot").getChildByName("listDiamond");
        var dias = listDiamond.getChildren();
        for (var i = 0; i < dias.length; i++) {
            dias[i].loadTexture(config.diamond);
            dias[i].setVisible(false);
            dias[i].stopAllActions();
        }

        btn.runAction(new cc.Sequence(new cc.FadeOut(0), cc.delayTime(1), new cc.CallFunc(function () {
            this.setVisible(true);
            this.runAction(new cc.Sequence(new cc.FadeIn(1), new cc.CallFunc(function () {

                var jackpot = ccui.Helper.seekWidgetByName(_layout, "jackpot");
                jackpot.runAction(new cc.Sequence(new cc.ScaleTo(0.2, 0.27), new cc.ScaleTo(0.2, 0.25)));
                for (var j = 0; j < jackpotMgr.jackpot[1][channelMgr.selectedChanel]; j++) {
                    var dia = dias[j];
                    dia.runAction(new cc.Sequence(cc.delayTime(j * 0.32 + 0.4), new cc.CallFunc(function () {
                        this.setVisible(true);
                    }, dia), new cc.ScaleTo(0.1, 1.2), new cc.ScaleTo(0.1, 1)));
                }
                for (var j = 0; j < dias.length; j++) {
                    var dia = dias[j];
                    dia.runAction(new cc.Sequence(cc.delayTime(dias.length * 0.3), new cc.ScaleTo(0.3, 1.2), new cc.CallFunc(function () {
                        jackpotMgr.createAnim(this, "SmallDiamond");
                        this.anim.gotoAndPlay("1", -1);
                        this.anim.setCompleteListener(function () {
                            this.runAction(new cc.ScaleTo(0.1, 1));
                        }.bind(this));
                    }, dia)));
                }

            }, this)));
            this.runAction(new cc.Sequence(cc.delayTime(jackpotMgr.jackpot[1][channelMgr.selectedChanel] * 0.32 + 2.9), new cc.CallFunc(function () {
                if (jackpotMgr.jackpot[1][channelMgr.selectedChanel] == 4) {
                    jackpotMgr.createAnim(this, "Bang1");
                    this.anim.gotoAndPlay("1", -1);
                } else {
                    if (this.anim) {
                        this.removeChild(this.anim);
                        this.anim = null;
                    }
                }
            }, this)));
        }, btn)));
    },

    createAnim: function (control, anim) {
        cc.log(anim);
        if (control === undefined || control == null || anim === undefined || anim == "") return null;

        if (control.anim) {
            control.removeChild(control.anim);
            control.anim = null;
        }

        var eff = db.DBCCFactory.getInstance().buildArmatureNode(anim);
        // cc.log("create ok");
        if (eff) {
            control.addChild(eff);
            eff.setPosition(control.getContentSize().width / 2, control.getContentSize().height / 2);
            //eff.getAnimation().gotoAndPlay("1", -1, -1, 0);
            control.anim = eff;
            // cc.log("has effect");
        }
        return eff;
    },

    getJackpotConfig: function (id) {
        return this.jackpotJson[id];
    }
})

JackpotMgr.instance = null;
JackpotMgr.getInstance = function () {
    if (!JackpotMgr.instance) {
        JackpotMgr.instance = new JackpotMgr();
    }
    return JackpotMgr.instance;
};
var jackpotMgr = JackpotMgr.getInstance();

JackpotMgr.CMD_JACKPOT_INFO = 25004;
JackpotMgr.CMD_GET_GEM = 25005;
JackpotMgr.CMD_GET_JACKPOT = 25006;
JackpotMgr.CMD_NOTIFY_GET_GEM = 25010;
JackpotMgr.CMD_NOTIFY_GET_JACKPOT = 25011;