/**
 * Created by GSN on 10/21/2015.
 */

var audioEngine = cc.audioEngine;

var gameSound = function(){}
gamedata.sound = true;

gameSound.getRandomSound = function(path,number,duoi)
{
    var ret = path;
    var rd = Math.floor(Math.random() * number + 1);
    if(rd > number)
        rd = number;
    ret += rd;
    ret += ".";
    ret += duoi;

    if(cc.sys.os == cc.sys.OS_WINDOWS || cc.sys.os == cc.sys.OS_WP8 || cc.sys.os == cc.sys.OS_WINRT)
    {
        ret = "res/" + StringUtility.replaceAll(ret,"mp3","wav");
    }

    return ret;
}

gameSound.playChiaBai = function(){
    if(gamedata.sound)

        audioEngine.playEffect(g_sounds.chiabai,false);
}

gameSound.playFire1 = function(){
    if(gamedata.sound)

        audioEngine.playEffect(g_sounds.fire1,false);
}

// Nguoi noi

gameSound.playSoundbaobinh_12caydongmau = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.baobinh_12caydongmau, false);
}
gameSound.playSoundbaobinh_12caydongmau = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.baobinh_12caydongmau, false);
}
gameSound.playSoundbaobinh_13caydongmau = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.baobinh_13caydongmau, false);
}
gameSound.playSoundbaobinh_3caisanh = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.baobinh_3caisanh, false);
}
gameSound.playSoundbaobinh_3caithung = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.baobinh_3caithung, false);
}
gameSound.playSoundbaobinh_lucphebon = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.baobinh_lucphebon, false);
}
gameSound.playSoundbaobinh_sanhrong = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.baobinh_sanhrong, false);
}
gameSound.playSoundbatsapnay = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.batsapnay, false);
}
gameSound.playSoundBinhLung = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.BinhLung, false);
}
gameSound.playSoundchaomung_1 = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.chaomung_1, false);
}
gameSound.playSoundchaomung_2 = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.chaomung_2, false);
}
gameSound.playSounde_OutCan = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.e_OutCan, false);
}
gameSound.playSounde_OutVol = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.e_OutVol, false);
}
gameSound.playSoundfinishgroupcard = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.finishgroupcard, false);
}
gameSound.playSoundMauBinh = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.MauBinh, false);
}
gameSound.playSoundmaubinh_12caydongmau = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.maubinh_12caydongmau, false);
}
gameSound.playSoundmaubinh_13caydongmau = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.maubinh_13caydongmau, false);
}
gameSound.playSoundmaubinh_3caisanh = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.maubinh_3caisanh, false);
}
gameSound.playSoundmaubinh_3caithung = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.maubinh_3caithung, false);
}
gameSound.playSoundmaubinh_lucphebon = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.maubinh_lucphebon, false);
}
gameSound.playSoundmaubinh_sanhrong = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.maubinh_sanhrong, false);
}
gameSound.playSoundrematch_1 = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.rematch_1, false);
}
gameSound.playSoundrematch_2 = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.rematch_2, false);
}
gameSound.playSoundrematch_3 = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.rematch_3, false);
}
gameSound.playSoundsaproi = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.saproi, false);
}
gameSound.playSoundsobai_00 = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.sobai_00, false);
}
gameSound.playSoundstart_1 = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.start_1, false);
}
gameSound.playSounds_lose = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.s_lose, false);
}
gameSound.playSounds_win = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.s_win, false);
}
gameSound.playSoundThang = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.Thang, false);
}
gameSound.playSoundthang_culu = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.thang_culu, false);
}
gameSound.playSoundthang_doi = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.thang_doi, false);
}
gameSound.playSoundthang_mauthau = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.thang_mauthau, false);
}
gameSound.playSoundthang_samchicuoi = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.thang_samchicuoi, false);
}
gameSound.playSoundthang_sanh = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.thang_sanh, false);
}
gameSound.playSoundthang_thu = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.thang_thu, false);
}
gameSound.playSoundthang_thung = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.thang_thung, false);
}
gameSound.playSoundthang_thungphasanh = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.thang_thungphasanh, false);
}
gameSound.playSoundthang_tuquy = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.thang_tuquy, false);
}
gameSound.playSoundThua = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.Thua, false);
}
gameSound.playSoundwin_1 = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.win_1, false);
}
gameSound.playSoundwin_2 = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.win_2, false);
}
gameSound.playSoundwin_3 = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.win_3, false);
}
gameSound.playSoundxepbai_culu = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.xepbai_culu, false);
}
gameSound.playSoundxepbai_doi = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.xepbai_doi, false);
}
gameSound.playSoundxepbai_mauthau = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.xepbai_mauthau, false);
}
gameSound.playSoundxepbai_samchi = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.xepbai_samchi, false);

}
gameSound.playSoundxepbai_sanh = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.xepbai_sanh, false);
}
gameSound.playSoundxepbai_thu = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.xepbai_thu, false);
}
gameSound.playSoundxepbai_thung = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.xepbai_thung, false);
}
gameSound.playSoundxepbai_thungphasanh = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.xepbai_thungphasanh, false);
}
gameSound.playSoundxepbai_tuquy = function()
{
    if(gamedata.sound)
        audioEngine.playEffect(g_sounds.xepbai_tuquy, false);
}
