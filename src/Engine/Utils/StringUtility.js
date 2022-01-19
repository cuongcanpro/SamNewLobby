/**
 * Created by hoangnq on 8/14/15.
 */

var StringUtility = function () {
};

StringUtility.JSON_ERROR_DEFAULT = -99999;

/**
 * Description: Describe all tokens can be used.
 * token:       description:            example:
 * #YYYY#       4-digit year            1999
 * #YY#         2-digit year            99
 * #MMMM#       full month name         February
 * #MMM#        3-letter month name     Feb
 * #MM#         2-digit month number    02
 * #M#          month number            2
 * #DDDD#       full weekday name       Wednesday
 * #DDD#        3-letter weekday name   Wed
 * #DD#         2-digit day number      09
 * #D#          day number              9
 * #th#         day ordinal suffix      st
 * #hhhh#       2-digit 24-based hour   17, 09
 * #hhh#        24-based hour           17, 9
 * #hh#         2-digit 12-based hour   12, 01
 * #h#          12-based hour           12, 1
 * #mm#         2-digit minute          09, 59
 * #m#          minute                  9, 59
 * #ss#         2-digit second          09, 59
 * #s#          second                  9, 59
 * #msmsms#     3-digit millis          001, 999
 * #msms#       2-digit millis          01, 99
 * #ms#         1-digit millis          1, 9
 * #ampm#       "am" or "pm"            am, pm
 * #AMPM#       "AM" or "PM"            AM, PM
 */
StringUtility.customFormatDate = function(millis, format){

    var date = new Date(millis);
    var YYYY, YY, MMMM, MMM, MM, M, DDDD, DDD, DD, D, hhhh, hhh, hh, h, mm, m, ss, s, msmsms, msms, ms, ampm, AMPM, dMod, th;

    YY = ((YYYY = date.getFullYear()) + "").slice(-2);
    MM = (M = date.getMonth() + 1) < 10 ? ("0" + M) : M;
    MMM = (MMMM = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][M - 1]).slice(0, 3);
    DD = (D = date.getDate()) < 10 ? ("0" + D) : D;
    DDD = (DDDD = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][date.getDay()]).slice(0, 3);
    dMod = D % 10;
    th = (D >= 10 && D <= 20) ? "th" : (dMod == 1 ? "st" : (dMod == 2 ? "nd" : (dMod == 3 ? "rd" : "th")));
    hhhh = (hhh = date.getHours()) < 10 ? ("0" + hhh) : hhh;
    hh = (h = hhh > 12 ? hhh - 12 : (hhh == 0 ? 12 : hhh)) < 10 ? ("0" + h) : h;
    AMPM = (ampm = hhh < 12 ? "am" : "pm").toUpperCase();
    mm = (m = date.getMinutes()) < 10 ? ("0" + m) : m;
    ss = (s = date.getSeconds()) < 10 ? ("0" + s) : s;
    ms = Math.floor((msms = Math.floor((msmsms = millis % 1000) / 10)) / 10);

    return format.replace("#YYYY#", YYYY).replace("#YY#", YY)
        .replace("#MMMM#", MMMM).replace("#MMM#", MMM).replace("#MM#", MM).replace("#M#", M)
        .replace("#DDDD#", DDDD).replace("#DDD#", DDD).replace("#DD#", DD).replace("#D#", D)
        .replace("#hhhh#", hhhh).replace("#hhh#", hhh).replace("#hh#", hh)
        .replace("#mm#", mm).replace("#m#", m).replace("#ss#", ss).replace("#s#", s)
        .replace("#msmsms#", msmsms).replace("#msms#", msms).replace("#ms", ms)
        .replace("#ampm#", ampm).replace("#AMPM#", AMPM).replace("#th#", th);
};

StringUtility.standartNumber = function (number, separator) {            // Hien thi number theo chuan{
    if (separator == null) separator = ".";

    var tmp = "" + number;
    if (tmp.length < 4) {
        return tmp;
    }
    var tmp2 = "";
    for (var i = 0; i < tmp.length - 1; i++) {
        if (((i + 1) % 3) == 0) {
            tmp2 = separator + tmp.charAt(tmp.length - i - 1) + tmp2;
        }
        else {
            tmp2 = tmp.charAt(tmp.length - i - 1) + tmp2;
        }
    }
    tmp2 = tmp.charAt(0) + tmp2;
    return tmp2;
};

StringUtility.formatNumberSymbol = function (number, maxLen) {
    if (!maxLen) maxLen = 0;
    var sign = number < 0 ? "-" : "";
    number = Math.floor(Math.abs(number));
    if (number < 1000) return sign + number;

    var symbols = ["", "K", "M", "B", "T"];
    for (var symIdx = 0; symIdx < symbols.length; symIdx++) {
        var num = number / Math.pow(10, (symIdx * 3));
        var temp = "" + Math.floor(num);
        var minLen = sign.length + temp.length + Math.floor((temp.length - 1)/3) + symbols[symIdx].length;

        var canGoOn = temp.length > 3 && (symIdx < symbols.length - 1);
        if (minLen > maxLen && canGoOn) continue;
        else{
            var intPart = sign + StringUtility.standartNumber(Math.floor(num), ",");
            if (number % Math.pow(10, (symIdx * 3)) == 0)
                return intPart + symbols[symIdx];
            else if (symIdx > 0){
                if ((minLen > maxLen - 2) && canGoOn) continue;
                var floatPart = ".";
                temp = number % Math.pow(10, (symIdx * 3));
                floatPart += Math.floor(temp / Math.pow(10, (symIdx * 3) - 1));
                if (minLen + floatPart.length < maxLen)
                    floatPart += Math.floor(temp / Math.pow(10, (symIdx * 3) - 2));
                return intPart + floatPart + symbols[symIdx];
            }
            else return intPart + symbols[symIdx];
        }
    }
};

// StringUtility.formatNumberSymbol = function (number, maxLen) {
//     var retVal = "";
//     if (number < 0)
//         retVal = "-";
//     number = Math.floor(Math.abs(number));
//
//     if (number >= 1000000000) {
//         return retVal + StringUtility.numberConvert(number, 1000000000) + "B";
//     }
//     else if (number >= 1000000) {
//         return retVal + StringUtility.numberConvert(number, 1000000) + "M";
//     }
//     else if (number >= 1000) {
//         return retVal + StringUtility.numberConvert(number, 1000) + "K";
//     } else {
//         retVal = retVal + number;
//     }
//     return retVal;
// }

StringUtility.pointNumber = function (number) {
    if (typeof number === 'undefined')
        return "";
    var ret = Math.floor(Math.abs(number));
    return (number < 0 ? "-" : "") + ret.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

StringUtility.numberConvert = function (number, div) {
    var a = parseInt(number / (div / 100));
    var b = parseInt(a / 100);

    a = a - b * 100;
    if (a == 0) {
        return "" + b;
    }
    else {
        if (a > 9) {
            if (a % 10 == 0) {
                return b + "." + a / 10;
            }
            else {
                return b + "." + a;
            }
        }
        else {
            return b + ".0" + a;
        }
    }
};

StringUtility.replaceAll = function (text, searchText, replaceText) {
    return text.split(searchText).join(replaceText);
};

StringUtility.replaceNameInValid = function (text) {
    var array = ["gold", "mua", "ban"];
    for (var i = 0; i < array.length; i++) {
        text = StringUtility.replaceAll(text, array[i], "****");
    }
    return text;
};

StringUtility.subStringText = function (text, lb) {
    if (typeof lb === 'undefined') return text;

    var str = lb.getString();
    if (text <= str.length) return text;

    return text.substring(0, str.length - 3) + "...";
};

StringUtility.subStringTextLength = function (text, length) {
    if(text.length <= length) return text;

    return text.substring(0,length-2) + "...";
};

StringUtility.checkStringNormal = function (text) {
    var reg = new RegExp("^([a-zA-Z0-9.,?!]{1,})$");
    return reg.test(text);
};

StringUtility.parseJSON = function (json) {
    var ret = null;
    try {
        ret = JSON.parse(json);
    }
    catch (e) {
        ret = {};
        ret.error = StringUtility.JSON_ERROR_DEFAULT;
    }
    return ret;
};

StringUtility.getFontDefault = function (fnt) {

    var defaultPath = "fonts/";
    var defaultFont = "tahoma.ttf";

    if(fnt === undefined || fnt == null || fnt == "")
        return defaultPath + defaultFont;

    var path = "";
    var idxComma = fnt.lastIndexOf("/");
    if(idxComma > -1)
    {
        path = fnt.substring(idxComma+1,fnt.length);
    }
    else
    {
        path = fnt;
    }
    return defaultPath + path;
};

StringUtility.getStringLocalized = function (str) {
    if(str === undefined || str == null || str == "") return str;

    var sLocalized = "str_";
    var idxLocalized = str.indexOf(sLocalized);
    var sizeLocalized = sLocalized.length;

    if(idxLocalized > -1)
    {
        return LocalizedString.to(str.substring(idxLocalized + sizeLocalized,str.length));
    }
    else
    {
        return str;
    }
};


StringUtility.getTimeString = function (second) {
    var timeLeft = Math.floor(second);
    if(timeLeft <= 0) return 0;

    //var day = parseInt(timeLeft / 86400);
    //timeLeft -= day * 86400;
    var hour = parseInt(timeLeft / 3600);
    timeLeft -= hour * 3600;
    var minute = parseInt(timeLeft / 60);
    timeLeft -= minute * 60;

    var str = "";
    str = str + ((hour < 10) ? "0" + hour : hour) + ":";
    str = str + ((minute < 10) ? "0" + minute : minute) + ":";
    str = str + ((timeLeft < 10) ? "0" + timeLeft : timeLeft);
    return str;
};

StringUtility.getTimeString2 = function (second) {
    var timeLeft = Math.floor(second);
    if(timeLeft <= 0) return 0;

    //var day = parseInt(timeLeft / 86400);
    //timeLeft -= day * 86400;
    var hour = parseInt(timeLeft / 3600);
    timeLeft -= hour * 3600;
    var minute = parseInt(timeLeft / 60);
    timeLeft -= minute * 60;

    var str = "";
    str = str + ((hour < 10) ? "0" + hour : hour) + "h ";
    str = str + ((minute < 10) ? "0" + minute : minute) + "m ";
    str = str + ((timeLeft < 10) ? "0" + timeLeft : timeLeft)+"s";
    return str;
};

StringUtility.breakLabelToMultiLine = function(label, maxWidth) {
    label.ignoreContentAdaptWithSize(true);
    var str = label.getString().trim();
    var words = str.split(/[\s\n]+/);
    if (words.length == 0) {
        label.setString("");
        return;
    }
    else{
        var curIdx = 0;
        var resStr = "";
        var curStr = "";
        var newLine = true;
        while (curIdx < words.length) {
            if (newLine) {
                curStr = words[curIdx++];
                newLine = false;
            }
            else{
                label.setString(curStr + " " + words[curIdx]);
                if (label.getAutoRenderSize().width <= maxWidth){
                    curStr += " " + words[curIdx++];
                }
                else{
                    //break line
                    resStr += curStr + "\n";
                    newLine = true;
                    curStr = "";
                }
            }
        }
        resStr += curStr;
        label.setString(resStr);
    }
};