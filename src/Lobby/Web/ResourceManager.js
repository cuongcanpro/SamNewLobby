var ResourceManager = cc.Class.extend({
    ctor: function () {

    },

    loadDragonbone: function (dragonboneName) {
        var checkIn = false;
        var skeletonPath = "";
        var texturePath = "";
        for (var i = 0; i < lobby_animations.length; i++) {
            if (lobby_animations[i].key == dragonboneName) {
                skeletonPath = lobby_animations[i].folderpath + lobby_animations[i].skeleton;
                texturePath = lobby_animations[i].folderpath + lobby_animations[i].texture;
                checkIn = true;
                break;
            }
        }
        if (checkIn == false) {
            for (var i = 0; i < game_animations.length; i++) {
                if (game_animations[i].key == dragonboneName) {
                    skeletonPath = game_animations[i].folderpath + game_animations[i].skeleton;
                    texturePath = game_animations[i].folderpath + game_animations[i].texture;
                    checkIn = true;
                    break;
                }
            }
        }
        return db.DBCCHelper.getInstance().buildAsyncArmatureNode(skeletonPath, texturePath, dragonboneName, dragonboneName);
    },

    openGUI: function (guiName, callback, target) {
        callback();
    }
});


ResourceManager.firstInit = true;
ResourceManager.instance = null;

ResourceManager.getInstance = function () {
    if (ResourceManager.firstInit) {
        ResourceManager.instance = new ResourceManager();
        ResourceManager.firstInit = false;
    }
    return ResourceManager.instance;
};

var resourceManager = ResourceManager.getInstance();