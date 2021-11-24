var GameWrapper = cc.Class.extend({
   ctor: function () {

   }
});
GameWrapper.addIgnoreSceneCache = function () {
    sceneMgr.ignoreGuis.push("BoardScene");
}