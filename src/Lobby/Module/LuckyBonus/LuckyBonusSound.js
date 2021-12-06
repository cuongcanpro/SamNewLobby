/**
 * Created by AnhLN6 on 9/8/2021
 * Play sound for lucky bonus scene
 */

var audioEngine = cc.audioEngine;

var luckyBonusSound = function() {

};

luckyBonusSound.on = gamedata.sound;

luckyBonusSound.playLever = function(){
    if (luckyBonusSound.on){
        audioEngine.playEffect(luckyBonusSounds.lever, false);
    }
}

luckyBonusSound.playWheelRolling = function(){
    if (luckyBonusSound.on){
        return audioEngine.playEffect(luckyBonusSounds.wheelRolling, false);
    }
    //else {
    //    return null;
    //}
}

luckyBonusSound.playWheelRollingStop = function(){
    if (luckyBonusSound.on){
        return audioEngine.playEffect(luckyBonusSounds.wheelRollingStop, false);
    }
    //else{
    //    return null;
    //}
}

luckyBonusSound.playGoldCoin = function(){
    if (luckyBonusSound.on){
        audioEngine.playEffect(luckyBonusSounds.goldCoin, false);
    }
}

luckyBonusSound.playEnd = function(){
    if (luckyBonusSound.on){
        audioEngine.playEffect(luckyBonusSounds.end, false);
    }
}

luckyBonusSound.playWin = function(){
    if (luckyBonusSound.on){
        audioEngine.playEffect(luckyBonusSounds.win, false);
    }
}

luckyBonusSound.playScoreCount = function(){
    if (luckyBonusSound.on){
        audioEngine.playEffect(luckyBonusSounds.scoreCount, false);
    }
}

luckyBonusSound.preloadAllSound = function(){
    for (var soundPath in luckyBonusSounds){
        audioEngine.preloadEffect(luckyBonusSounds[soundPath]);
    }
    audioEngine.stopAllEffects();
    audioEngine.stopMusic();
}

var luckyBonusSounds = {
    lever: "sounds/luckybonus/lever.mp3",
    wheelRolling: "sounds/luckybonus/wheel_rolling_2.mp3",
    wheelRollingStop: "sounds/luckybonus/wheel_rolling_stop.mp3",
    scoreCount: "sounds/luckybonus/score_count.mp3",
    goldCoin: "sounds/luckybonus/gold_coin.mp3",
    end: "sounds/luckybonus/end.mp3",
    win: "sounds/luckybonus/win.mp3",
}