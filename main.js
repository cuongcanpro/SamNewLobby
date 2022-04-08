
cc.game.onStart = function () {

    if (!cc.sys.isNative && document.getElementById("cocosLoading"))
        document.body.removeChild(document.getElementById("cocosLoading"));

    cc.view.enableRetina(true);
    cc.view.adjustViewPort(true);
    if(!cc.sys.isNative)
    {
        cc.resPath = "./res";
        cc.loader.resPath = srcPath || "";
        jsb.fileUtils.init();
        jsb.fileUtils.analysticFrom(g_resources);
        cc.view.setDesignResolutionSize(Constant.WIDTH, Constant.HEIGHT, cc.ResolutionPolicy.SHOW_ALL);
    } else {
        // Setup the resolution policy and design resolution size
        var ratio = cc.winSize.width / cc.winSize.height;
        if (ratio < 1)
            ratio = 1 / ratio;
        if(ratio <= 2)
        {
            cc.log("RATIO " + ratio);
            if (ratio <= 1.5) {
                cc.view.setDesignResolutionSize(Constant.WIDTH, Constant.HEIGHT, cc.ResolutionPolicy.FIXED_WIDTH);
            }
            else {
                cc.view.setDesignResolutionSize(Constant.WIDTH, Constant.HEIGHT, cc.ResolutionPolicy.FIXED_HEIGHT);
            }
        }
        else {
            cc.view.setDesignResolutionSize(Constant.WIDTH, Constant.HEIGHT, cc.ResolutionPolicy.FIXED_HEIGHT);
        }
        //cc.view.setDesignResolutionSize(Constant.WIDTH, Constant.HEIGHT, cc.ResolutionPolicy.FIXED_HEIGHT);
    }
    cc.log("DESIGN RESOLUTION " + Constant.WIDTH + " " + Constant.HEIGHT);

    //cc.view.setDesignResolutionSize(Constant.WIDTH, Constant.HEIGHT, cc.ResolutionPolicy.NO_BORDER);
    //cc.log("WIN SiZE " + JSON.stringify(cc.winSize));
    //cc.log("DIRECTOR SIZE " + JSON.stringify(cc.director.getVisibleSize()));
    cc.view.resizeWithBrowserSize(true);

    //return;
    jsb.fileUtils.getSearchPaths();
    jsb.fileUtils.addSearchPath("/");
    jsb.fileUtils.addSearchPath("res/");
    jsb.fileUtils.addSearchPath("res/common/");
    jsb.fileUtils.addSearchPath("res/Lobby");
    jsb.fileUtils.addSearchPath("res/Board");
    jsb.fileUtils.addSearchPath("res/Event");



    if (cc.sys.isNative) {
        var downloadPath = fr.NativeService.getFolderUpdateAssets();
        jsb.fileUtils.addSearchPath(downloadPath + "/res/Event", true);
        jsb.fileUtils.addSearchPath(downloadPath + "/res/Lobby", true);
        jsb.fileUtils.addSearchPath(downloadPath + "/res/Board", true);
    }
    engine.ipad = false;
    engine.ipad = (cc.winSize.width / cc.winSize.height <= 4 / 3) && (cc.winSize.width > 480);
    // init
    cc.LoaderScene.preload(g_resources, function () {
        if(!cc.sys.isNative)
        {
            cc.director.getScheduler().scheduleUpdate(engine.HandlerManager.getInstance(),0,false);

            try {
                var version = versionCode.substr(3, versionCode.length-3);
                gsntracker.init("tala", version);
                if (Config.ENABLE_CHEAT && gsntracker.setTestSDK) gsntracker.setTestSDK(true);
                cc.log("day la code moi: ", version);
            } catch  (e){
                cc.error("Can not init gsntracker");
            }
        }
        LocalizedString.preload(function () {
            gameMgr.startGame();
        });

    }, this);
};

cc.game.run();

var saveRestart = cc.game.restart;
cc.game.restart = function () {
    cc.log("CALL RESTART GAME NE ");
    downloadEventManager.pauseDownload();
    saveRestart();
}



