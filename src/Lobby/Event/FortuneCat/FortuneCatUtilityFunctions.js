/**
 * Created by AnhLN6 on 11/4/2021
 * Contains common functions used in Fortune Cat module
 */

let FortuneCatUtility = function(){};

///at "." every 3 digits
FortuneCatUtility.formatCatGold = function(gold){
    let totalGold = parseInt(gold);
    let resultString = "";

    while (Math.floor(totalGold / 1000) !== 0){
        let addedString = (totalGold % 1000).toString();
        while (addedString.length < 3){
            addedString = "0" + addedString;
        }
        resultString = "." + addedString + resultString;
        totalGold = Math.floor(totalGold / 1000);
    }

    resultString = (totalGold % 1000).toString() + resultString;
    return resultString;
}

///duration in second -> hour
FortuneCatUtility.formatCatTime = function(time){
    let addedString = Math.floor(time / 3600);
    addedString = addedString.toString();

    return addedString + "h";
}

///duration in second -> hour : minute : second
FortuneCatUtility.formatTime = function(duration){
    let returnTime = {};
    let hour = Math.floor(duration / 3600);
    let minute = Math.floor((duration - hour * 3600) / 60);
    let second = (duration - hour * 3600 - minute * 60);

    hour = FortuneCatUtility.formatTimeComponents(hour);
    minute = FortuneCatUtility.formatTimeComponents(minute);
    second = FortuneCatUtility.formatTimeComponents(second);

    returnTime.hour = hour;
    returnTime.minute = minute;
    returnTime.second = second;

    return returnTime;
}

///convert time component (hour, minute, second,...) into 2-digit
FortuneCatUtility.formatTimeComponents = function(component){
    if (component >= 10){
        return component.toString();
    }
    else{
        return "0" + component.toString();
    }
}