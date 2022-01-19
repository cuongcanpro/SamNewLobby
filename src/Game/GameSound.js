/**
 * Created by GSN on 10/21/2015.
 */

var audioEngine = cc.audioEngine;

var gameSound = function () {
};

gameSound.on = settingMgr.sound;


gameSound.getRandomSound = function(path,number,duoi)
{
    var ret = path;
    var rd = Math.floor(Math.random() * number + 1);
    if(rd > number)
        rd = number;
    ret += rd;
    ret += ".";
    ret += duoi;

    if( cc.sys.os == cc.sys.OS_WP8 || cc.sys.os == cc.sys.OS_WINRT)
    {
        ret = "res/" + StringUtility.replaceAll(ret,"mp3","wav");
    } else {
        ret = "res/" + ret;
    }

    return ret;
};

gameSound.playChatAnTien = function(){
    if(gameSound.on)
        audioEngine.playEffect(g_sounds.chatantien,false);
};

gameSound.playChat = function(){
    if(gameSound.on)
        audioEngine.playEffect(g_sounds.chat,false);
};

gameSound.clickQuanbai = function(){
    if(gameSound.on)

        audioEngine.playEffect(g_sounds.chonquanbai,false);
};

gameSound.playChiaBai = function(){
    if(gameSound.on)

        audioEngine.playEffect(g_sounds.chiabai,false);
};

gameSound.playDkThoat = function(){
    if(gameSound.on)

        audioEngine.playEffect(g_sounds.dkthoat,false);
};

gameSound.playChonQuanbai = function(){
    if(gameSound.on)

        audioEngine.playEffect(g_sounds.chonquanbai,false);
};

gameSound.playDanhBai = function(){
    if(gameSound.on)

        audioEngine.playEffect(g_sounds.danhbai,false);
};

gameSound.playFire1 = function(){
    if(gameSound.on)

        audioEngine.playEffect(g_sounds.fire1,false);
};

gameSound.playFire2 = function(){
    if(gameSound.on)

        audioEngine.playEffect(g_sounds.fire2,false);
};

gameSound.playJackpot = function(){
    if(gameSound.on)

        audioEngine.playEffect(g_sounds.jackpot,false);
};
gameSound.playThua = function(){
    if(gameSound.on)
    {
        audioEngine.playEffect(g_sounds.thua,false);
        gameSound.playThuaNoi();
    }
};

gameSound.playChupanh = function(){
    if(gameSound.on && cc.sys.isNative)

        audioEngine.playEffect(g_sounds.chupanh,false);
};

gameSound.playStart1 = function(){
    if(gameSound.on)

        audioEngine.playEffect(g_sounds.start1,false);
};

gameSound.playStart2 = function(){
    if (gameSound.on)
        audioEngine.playEffect(g_sounds.start2,false);
};

gameSound.playTimer = function(){
    if(gameSound.on)

        audioEngine.playEffect(g_sounds.timer,false);
};

gameSound.playThang = function(){
    if(gameSound.on)
    {
        audioEngine.playEffect(g_sounds.thang,false);
        gameSound.playThangNoi();
    }
};

gameSound.playHuyThoat = function(){
    if(gameSound.on)

        audioEngine.playEffect(g_sounds.huythoat,false);
};

gameSound.playEnemySanhToicot = function(){
    if (gameSound.on)
        audioEngine.playEffect(g_sounds.enemysanhtoicot,false);
};

gameSound.playNguoikhacvaoban = function(){
    //if(gameSound.on)
    // audioEngine.playEffect(g_sounds.nguoikhacvaoban,false);
};

gameSound.playNhacbai = function(){
    if(gameSound.on)

        audioEngine.playEffect(g_sounds.nhacbai,false);
};

gameSound.playSanhtoicot = function(){
    if(gameSound.on)

        audioEngine.playEffect(g_sounds.sanhtoicot,false);
};

gameSound.playThoatban = function(){
    if(gameSound.on)

        audioEngine.playEffect(g_sounds.thoatban,false);
};

gameSound.playTrutien = function(){
    if(gameSound.on)

        audioEngine.playEffect(g_sounds.trutien,false);
};

gameSound.playVaoban = function(){
    //if(gameSound.on)

    //audioEngine.playEffect(g_sounds.vaoban,false);
};

gameSound.playPopUp  = function(){
    if(gameSound.on)

        audioEngine.playEffect(g_sounds.popup,false);
};

gameSound.playResult = function()
{
    if(gameSound.on)

        audioEngine.playEffect(g_sounds.result,false);
};

gameSound.playClick =  function()
{
    if(gameSound.on)
        audioEngine.playEffect(g_sounds.click,false);
};

gameSound.playXepbai =  function()
{
    if(gameSound.on)
        audioEngine.playEffect(g_sounds.xepbai,false);
};

// Nguoi noi
gameSound.playThangNoi =  function()
{
    if(gameSound.on)
    {
        audioEngine.playEffect(gameSound.getRandomSound("sounds/mp3/thang",5,"mp3"),false);
    }
};

gameSound.playChatbai =  function()
{
    if(gameSound.on)
        audioEngine.playEffect(gameSound.getRandomSound("sounds/mp3/chatbai",6,"mp3"),false);
};

gameSound.playThuaNoi =  function()
{
    if(gameSound.on)
        audioEngine.playEffect(gameSound.getRandomSound("sounds/mp3/thua",5,"mp3"),false);
};

gameSound.playMoisam =  function()
{
    if(gameSound.on)
        audioEngine.playEffect(gameSound.getRandomSound("sounds/mp3/moisam",3,"mp3"),false);
};

gameSound.playVaobanNoi =  function()
{
    if(gameSound.on)
        audioEngine.playEffect(gameSound.getRandomSound("sounds/mp3/vaoban",4,"mp3"),false);
};

gameSound.playHuysam =  function()
{
    if(gameSound.on)
        audioEngine.playEffect(gameSound.getRandomSound("sounds/mp3/huysam",4,"mp3"),false);
};

gameSound.playChiabaiNoi =  function()
{
    if(gameSound.on)
        audioEngine.playEffect(gameSound.getRandomSound("sounds/mp3/chiabainoi",4,"mp3"),false);
};

gameSound.playThoatbanNoi =  function()
{
    if(gameSound.on)
        audioEngine.playEffect(gameSound.getRandomSound("sounds/mp3/thoatban",4,"mp3"),false);
};



gameSound.playBoluot =  function()
{
    if(gameSound.on)
        audioEngine.playEffect(gameSound.getRandomSound("sounds/mp3/boluot",4,"mp3"),false);
};

gameSound.playLuotdau =  function()
{
    if(gameSound.on)
        audioEngine.playEffect(gameSound.getRandomSound("sounds/mp3/luotdau",3,"mp3"),false);
};

gameSound.playBobaitodautien =  function()      // nguoi nao do danh bo bai to
{
    if(gameSound.on)
        audioEngine.playEffect(gameSound.getRandomSound("sounds/mp3/dacbiet",4,"mp3"),false);
};

gameSound.playMinhdanhbaitovabibat =  function()      // minh danh bo bai dac biet bi bat
{
    if(gameSound.on)
        audioEngine.playEffect(gameSound.getRandomSound("sounds/mp3/dacbiet_minbibat",3,"mp3"),false);
};

gameSound.playMinhchatduocbobaito =  function()      // minh chat duoc 1 bo bai to
{
    if(gameSound.on)
        audioEngine.playEffect(gameSound.getRandomSound("sounds/mp3/minhchatduoc",4,"mp3"),false);
};

gameSound.playMinhkhongchatduocbobaito =  function()      // minh ko chat duoc 1 bo bai to
{
    if(gameSound.on)
        audioEngine.playEffect(gameSound.getRandomSound("sounds/mp3/minhboluot",3,"mp3"),false);
};

gameSound.playCardPlay = function () {
    if (gameSound.on)
        audioEngine.playEffect(gameSound.getRandomSound("sounds/board/play",4,"mp3"),false);
};

gameSound.playCardDrop = function (isMulti) {
    if (gameSound.on)
        if (!isMulti)
            audioEngine.playEffect(gameSound.getRandomSound("sounds/board/drop",3,"mp3"),false);
};

gameSound.playCardSlide = function () {
    if (gameSound.on)
        audioEngine.playEffect(gameSound.getRandomSound("sounds/board/dropMulti",4,"mp3"),false);
};
