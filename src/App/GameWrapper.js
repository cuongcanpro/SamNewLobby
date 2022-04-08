var GameWrapper = cc.Class.extend({
   ctor: function () {

   }
});
GameWrapper.addIgnoreSceneCache = function () {
    sceneMgr.ignoreGuis.push("BoardScene");
}

GameWrapper.isGame = function (name) {
    var game = LocalizedString.config("GAME");
    if (game.indexOf(name) >= 0) {
        return true;
    }
    return false;
}