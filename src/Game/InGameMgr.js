var InGameMgr = BaseMgr.extend({
    ctor: function () {
        this._super();
        this.preloadResource();
    },

    preloadResource: function () {
        var game_animations = [
            {folderpath:"res/Armatures/5doi/",skeleton:"skeleton.xml",texture:"texture.plist",key:"5Doi"},
            {folderpath:"res/Armatures/baosamthatbai/",skeleton:"skeleton.xml",texture:"texture.plist",key:"Baosamthatbai"},
            {folderpath:"res/Armatures/chansamthanhcong/",skeleton:"skeleton.xml",texture:"texture.plist",key:"Chansamthanhcong"},
            {folderpath:"res/Armatures/dongmau/",skeleton:"skeleton.xml",texture:"texture.plist",key:"Dongmau"},
            {folderpath:"res/Armatures/samdinh/",skeleton:"skeleton.xml",texture:"texture.plist",key:"Samdinh"},
            {folderpath:"res/Armatures/sanhtoicot/",skeleton:"skeleton.xml",texture:"texture.plist",key:"Sanhtoicot"},
            {folderpath:"res/Armatures/tuquy/",skeleton:"skeleton.xml",texture:"texture.plist",key:"Tuquy"},
            {folderpath:"res/Armatures/tuquyheo/",skeleton:"skeleton.xml",texture:"texture.plist",key:"Tuquyheo"},
            {folderpath:"res/Armatures/light/",skeleton:"skeleton.xml",texture:"texture.plist",key:"BG_light_bai"},
            {folderpath:"res/Armatures/doituquy/",skeleton:"skeleton.xml",texture:"texture.plist",key:"Haituquy"},
            {folderpath:"res/Armatures/jackpot/",skeleton:"skeleton.xml",texture:"texture.plist",key:"Jackpot"},
            {folderpath:"res/Armatures/bang/",skeleton:"skeleton.xml",texture:"texture.plist",key:"BangJackpot"},
            {folderpath:"res/Armatures/diamond/",skeleton:"skeleton.xml",texture:"texture.plist",key:"Diamond"},
            {folderpath:"res/Armatures/getjackpot/",skeleton:"skeleton.xml",texture:"texture.plist",key:"GetJackpot"},
            {folderpath:"res/Armatures/jackpotlogo/",skeleton:"skeleton.xml",texture:"texture.plist",key:"JackpotLogo"},
            {folderpath:"res/Armatures/smalldiamond/",skeleton:"skeleton.xml",texture:"texture.plist",key:"SmallDiamond"},
            {folderpath:"res/Armatures/tranDiamond/",skeleton:"skeleton.xml",texture:"texture.plist",key:"TranDiamond"},
            {folderpath:"res/Armatures/bang1/",skeleton:"skeleton.xml",texture:"texture.plist",key:"Bang1"},
            {folderpath:"res/Armatures/fivediamond/",skeleton:"skeleton.xml",texture:"texture.plist",key:"FiveDiamond"},
            {folderpath:"res/Armatures/Shuffle/",skeleton:"skeleton.xml",texture:"texture.plist",key:"Shuffle"},
            {folderpath:"res/Board/Animation/pointer/",skeleton:"skeleton.xml",texture:"texture.plist",key:"Pointer"}
        ];

        for (var i in game_animations) {
            db.DBCCFactory.getInstance().loadDragonBonesData(game_animations[i].folderpath + game_animations[i].skeleton, game_animations[i].key);
            db.DBCCFactory.getInstance().loadTextureAtlas(game_animations[i].folderpath + game_animations[i].texture, game_animations[i].key);
        }
    },

    initListener: function () {

    },

    onReceived: function (cmd, p) {
        switch (cmd) {
            case CMD.CMD_JOIN_ROOM_SUCCESS: {
                var join = new CmdReceivedJoinRoomSuccess(p);
                this.gameLogic = new GameLogic();
                this.gameLogic.initWith(join);
                cc.log("CMD_JOIN_ROOM_SUCCESS: ", JSON.stringify(join));

                var curGui = sceneMgr.getRunningScene().getMainLayer();
                if (cc.sys.isNative) {
                    sceneMgr.openScene(GameLayer.className, curGui._id, true);
                } else {
                    this.loading = sceneMgr.addLoading(LocalizedString.to("LOADING"), true, this);
                    this.loading.setTag(LOADING_TAG);

                    sceneMgr.openScene(GameLayer.className, curGui._id, true);

                }

                join.clean();
                //if(boardScene) boardScene.joinRoom(pkJoin);
                //SceneMgr.getInstance().openWithScene(gameLayer);
                return true;
            }
            case CMD.JOIN_ROOM_FAIL: {
                var join = new CmdReceivedJoinRoomFail(p);
                //cc.log("fail " + join.reason + "    " + sceneMgr.getRunningScene().getMainLayer()._id);
                sceneMgr.clearLoading();
                join.clean();
                if (sceneMgr.getRunningScene().getMainLayer() instanceof GameLayer) {

                    sceneMgr.showOkCancelDialog("Thông báo", "Kết nối lại bàn chơi thất bại", null, function () {
                        sceneMgr.getRunningScene().getMainLayer().quitGame();
                    });
                }
                else {
                    sceneMgr.showOkCancelDialog("Thông báo", "Bạn không thể vào bàn chơi này", null, null);
                }

                return true;
            }
            case CMD.CMD_REG_QUIT: {
                var reg = new CmdReceivedRegQuitRoom(p);
                if (reg.reg) {
                    Toast.makeToast(2.5, "Bạn sẽ được thoát khỏi phòng khi ván chơi kết thúc. Nhấn lần nữa để hủy!!!");
                    gameSound.playDkThoat();
                }
                else {
                    Toast.makeToast(2.5, "Bạn đã hủy đăng ký rời phòng...");
                    gameSound.playHuyThoat();
                }

                return true;
            }
            case CMD.CMD_UPDATEGAMEINFO: {
                var continuePlay = new CmdReceivedGameInfo(p);
                this.gameLogic = new GameLogic();
                this.gameLogic.continueWith(continuePlay);


                var gameLayer = new GameLayer();
                if (GameClient.connectLai) {
                    Toast.makeToast(2.5, "Kết nối lại hệ thống thành công", gameLayer);
                    GameClient.connectLai = false;

                }

                if (sceneMgr.getRunningScene().getMainLayer() instanceof GameLayer) {
                    cc.director.runScene(makeScene(gameLayer));
                }
                else {
                    this.loading = sceneMgr.addLoading(LocalizedString.to("LOADING"), true, this);
                    this.loading.setTag(LOADING_TAG);
                    sceneMgr.openScene(GameLayer.className);
                }

                continuePlay.clean();
                return true;
            }
            case CMD.CMD_USER_JOIN_ROOM:
            {
                var join = new CmdReceivedUserJoinRoom(p);
                this.gameLogic.userJoinRoom(join);
                join.clean();

                sceneMgr.updateCurrentGUI();
                return true;
            }
            case CMD.CMD_UPDATE_OWNERROOM:
            {
                var pk = new CmdReceivedUpdateOwnerRoom(p);
                this.gameLogic.updateOwnerRoom(pk);

                sceneMgr.updateCurrentGUI(pk);
                return true;
            }
            case CMD.CMD_AUTO_START:
            {
                var auto = new CmdReceivedAutoStart(p);
                this.gameLogic.autoStart(auto);
                cc.log("CMD.CMD_AUTO_START", JSON.stringify(auto));

                sceneMgr.updateCurrentGUI(auto);
                auto.clean();
                return true;
            }
            case CMD.CMD_FIRSTTURN:
            {
                var pk = new CmdReceivedFirstTurn(p);
                this.gameLogic.firstTurn(pk);
                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                return true;
            }
            case CMD.CMD_CHIABAI:
            {
                var pk = new CmdReceivedChiaBai(p);
                cc.log("CMD_CHIABAI " + JSON.stringify(pk));
                this.gameLogic.chiabai(pk);
                sceneMgr.updateCurrentGUI(pk);
                pk.clean();

                return true;
            }
            case CMD.CMD_DANHBAI:
            {
                var pk = new CmdReceivedDanhBai(p);
                cc.log("CMD_DANHBAI " + JSON.stringify(pk));
                this.gameLogic.danhbai(pk);
                sceneMgr.updateCurrentGUI(pk);
                pk.clean();

                return true;
            }
            case CMD.CMD_BOLUOT:
            {
                var pk = new CmdReceivedBoluot(p);
                this.gameLogic.boluot(pk);
                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                return true;
            }
            case CMD.CMD_CHANGETURN:
            {
                var pk = new CmdReceivedChangeTurn(p);
                this.gameLogic.changeturn(pk);

                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                return true;
            }
            case CMD.CMD_QUIT_ROOM:
            {
                var pk = new CmdReceivedUserExitRoom(p);
                this.gameLogic.userLeave(pk);

                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                return true;
            }
            case CMD.CMD_QUIT_REASON:
            {
                var pk = new CmdReceivedQuitroomReason(p);
                this.gameLogic._gameState = GameState.REASONQUIT;
                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                return true;
            }
            case CMD.CMD_QUIT_ROOM_SUCCESS:
            {
                this.gameLogic.quitRoom();
                sceneMgr.updateCurrentGUI();
                return true;
            }
            case CMD.CMD_QUYETDINHSAM:
            {
                var pk = new CmdReceivedQuyetDinhSam(p);
                this.gameLogic.quyetdinhsam(pk);

                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                return true;
            }
            case CMD.CMD_BAOSAM:
            {
                var pk = new CmdReceivedBaoSam(p);
                this.gameLogic.baosam(pk);

                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                return true;
            }
            case CMD.CMD_HUYBAOSAM:
            {
                var pk = new CmdReceivedHuyBaoSam(p);
                this.gameLogic.huybaosam(pk);

                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                return true;
            }
            case CMD.CMD_CHATCHONG:
            {
                var pk = new CmdReceivedChatChong(p);
                this.gameLogic.chatchong(pk);

                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                return true;
            }
            case CMD.CMD_ENDGAME:
            {
                var pk = new CmdReceivedEndGame(p);
                cc.log("CMD_ENDGAME:", JSON.stringify(pk));

                setTimeout(function () {
                    inGameMgr.gameLogic.endgame();
                    sceneMgr.updateCurrentGUI(pk);
                }, 1000 * PlayerView.TIME_DELAY_ENDGAME_PACKET);
                pk.clean();
                return true;
            }
            case CMD.CMD_UPDATEMATH:
            {
                var pk = new CmdReceivedUpdateMath(p);
                this.gameLogic.updateMath(pk);
                cc.log("CMD.CMD_UPDATEMATH", JSON.stringify(pk));

                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                return true;
            }
            case CMD.CMD_RECEIVE_JACKPOT:
            {
                var pk = new CmdReceivedJackpot(p);
                this.gameLogic.jackpot(pk);

                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                return true;
            }
            case CMD.CMD_GETPLAYERS:
            {
                var pk = new CmdReceivedGetPlayers(p);
                sceneMgr.updateCurrentGUI(pk);
                pk.clean();
                return true;
            }
        }
        return false;
    },
})

InGameMgr.instance = null;
InGameMgr.getInstance = function () {
    if (!InGameMgr.instance) {
        InGameMgr.instance = new InGameMgr();
    }
    return InGameMgr.instance;
};
var inGameMgr = InGameMgr.getInstance();

