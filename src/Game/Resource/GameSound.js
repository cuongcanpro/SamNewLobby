/**
 * Created by GSN on 10/21/2015.
 */

var audioEngine = cc.audioEngine;

var gameSound = function () {
};

gameSound.getRandomSound = function(path,number,duoi)
{
    var ret = path;
    var rd = Math.floor(Math.random() * number + 1);
    if(rd > number)
        rd = number;
    ret += rd;
    ret += ".";
    ret += duoi;

    if(cc.sys.os == cc.sys.OS_WP8 || cc.sys.os == cc.sys.OS_WINRT)
    {
        ret = "res/" + StringUtility.replaceAll(ret,"mp3","wav");
    }

    return ret;
}

gameSound.getRandom =  function(percent)
{
    var test = Math.floor(Math.random() * 100);
    if(test <= percent)
        return true;
    return false;
}

gameSound.clickQuanbai = function(){
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.chonquanbai,false);
}

gameSound.playChiaBai = function(){
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.chiabai,false);
}

gameSound.playDkThoat = function(){
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.dkthoat,false);
}

gameSound.playChonQuanbai = function(){
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.chonquanbai,false);
}

gameSound.playDanhBai = function(){
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.danhbai,false);
}

gameSound.playJackpot = function(){
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.jackpot,false);
}

gameSound.playThua = function(){
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.thua,false);
}

gameSound.playTimer = function(){
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.timer,false);
}

gameSound.playThang = function(){
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.thang,false);
}

gameSound.playHuyThoat = function(){
    if(gamedata.sound)

        audioEngine.playEffect(g_sounds.huythoat,false);
}

gameSound.playNhacbai = function(){
    if(gamedata.sound)

        audioEngine.playEffect(g_sounds.nhacbai,false);
}

gameSound.playThoatban = function(){
    if(gamedata.sound)

        audioEngine.playEffect(g_sounds.thoatban,false);
}

gameSound.playVaoban = function(){
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.vaoban,false);
}

gameSound.playClick =  function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.click,false);
}

gameSound.playXepbai =  function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.xepbai,false);
}

gameSound.playAnBaiRac =  function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.anbairac,false);
}

gameSound.playBatDauGame =  function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.batdaugame,false);
}

gameSound.playGuiBai =  function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.guibai,false);
}

gameSound.playHaPhom =  function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.haphom,false);
}

gameSound.playMom =  function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.mom,false);
}

gameSound.playBocbai =  function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.bocbai,false);
}

gameSound.playU =  function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.u,false);
}


// Nguoi noi
gameSound.playThangNoi =  function()
{
    if(gamedata.sound)
        audioEngine.playEffect(gameSound.getRandomSound("res/sounds/mp3/thang",7,"mp3"),false);
}

gameSound.playThuaNoi =  function()
{
    if(gamedata.sound)
        audioEngine.playEffect(gameSound.getRandomSound("res/sounds/mp3/thua",6,"mp3"),false);
}

gameSound.playAnChotNoi =  function()
{
    if(gamedata.sound)
        audioEngine.playEffect(gameSound.getRandomSound("res/sounds/mp3/anchot",5,"mp3"),false);
}

gameSound.playAnQuanBaiNoi =  function()
{
    if(gamedata.sound)
        audioEngine.playEffect(gameSound.getRandomSound("res/sounds/mp3/anquanbai",9,"mp3"),false);
}

gameSound.playDanhBaiThuongNoi =  function()
{
    if(gamedata.sound)
        if(Math.random() < 0.5)
            audioEngine.playEffect(gameSound.getRandomSound("res/sounds/mp3/danhbaithuong",6,"mp3"),false);
}

gameSound.playDanhQuanChotNoi =  function()
{
    if(gamedata.sound)
        if(Math.random() < 0.5)
            audioEngine.playEffect(gameSound.getRandomSound("res/sounds/mp3/danhquanchot",4,"mp3"),false);
}

gameSound.playTimeNoi =  function()
{
    if(gamedata.sound)
        audioEngine.playEffect(gameSound.getRandomSound("res/sounds/mp3/time",5,"mp3"),false);
}

gameSound.playUTronNoi =  function()
{
    if(gamedata.sound)
        audioEngine.playEffect(gameSound.getRandomSound("res/sounds/mp3/utron",5,"mp3"),false);
}

gameSound.playUNoi =  function()
{
    if(gamedata.sound)
        audioEngine.playEffect(gameSound.getRandomSound("res/sounds/mp3/u",5,"mp3"),false);
}

gameSound.playVaoBanNoi =  function()
{
    if(gamedata.sound)
        if(Math.random() < 0.5)
            audioEngine.playEffect(gameSound.getRandomSound("res/sounds/mp3/vaoban",6,"mp3"),false);
}

gameSound.playVongBinhThuongBocBaiNoi =  function()
{
    if(gamedata.sound)
        if(Math.random() < 0.5)
            audioEngine.playEffect(gameSound.getRandomSound("res/sounds/mp3/vongthuong_bocbai",7,"mp3"),false);
}

gameSound.playVongCuoiBocBaiNoi =  function()
{
    if(gamedata.sound)
        audioEngine.playEffect(gameSound.getRandomSound("res/sounds/mp3/vongcuoi_bocbai",5,"mp3"),false);
}