var LocalNotification = cc.Class.extend({
    ctor: function () {
        cc.log("init local notification")
    },

    /**
     *  @param {Number} time (in milliseconds)
     *  @param {String} subText
     *  @param {String} contentTitle
     *  @param {String} contentText
     *  @param {Boolean} isUseVibrate
     */

    /* Code example */
    /*

        localNotification.addNotify(
            Date.now() + 10 * 1000,           // thong bao sau 10s tu luc goi ham
            "Welcome Gift",
            "🎁🎁 Hi you! Login and receive gold 🎁🎁",
            "💰💰💰 Your start up gold in day is 50000 💰💰💰",
            true
        )
    * */

    addNotify : function (time, subText, contentTitle, contentText, isUseVibrate) {
        if(this.checkOverTime(time)) {
            cc.log("local notification over time")
            return;
        }

        cc.log("den day r ")
        var data = {};

        if(!time || (!subText && !contentText && !contentTitle)){
            cc.log("wrong argument")
        }

        if(!isUseVibrate) isUseVibrate = false;

        // add time
        data.time = time;

        // add information
        if(subText){
            data.subText = subText;
        }

        if(contentText){
            data.contentText = contentText;
        }
        else {
            data.contentText = "";
        }

        if(contentTitle){
            data.contentTitle = contentTitle;
        }

        if(!this.checkSleepTime(time)){
            data.sound = "default";
        }
        else {
            cc.log("notification slient in sleep time");
        }

        data.extraData = new Date(time).toString() + " - " + LocalNotification.convertTime(time, LocalNotification.getLocalTimeZone(), LocalNotification.TZ_PHIL);
        cc.log("data", JSON.stringify(data))
        fr.platformWrapper.addNotify(data);
        // this.showNotify();
    },

    showNotify: function () {
        fr.platformWrapper.showNotify();
    },

    cancelAllNotification: function () {
        fr.platformWrapper.cancelAllNotification();
    },

    checkOverTime : function (time) {
        return Date.now() > time;
    },

    checkSleepTime :function (time) {
        var hour = new Date(time).getHours();
        cc.log("hours", hour);
        return (LocalNotification.START_SLEEP <= hour && hour <= LocalNotification.MID_NIGHT_1)
                || (LocalNotification.MID_NIGHT_2 <= hour && hour <= LocalNotification.END_SLEEP);
    }
})

LocalNotification.instance = null;
LocalNotification.START_SLEEP = 22;
LocalNotification.END_SLEEP = 8;
LocalNotification.MID_NIGHT_1 = 24;
LocalNotification.MID_NIGHT_2 = 0;
LocalNotification.TZ_PHIL = 8;

LocalNotification.getInstance = function () {
    if(!LocalNotification.instance){
        cc.log("vao day r local")
        LocalNotification.instance = new LocalNotification();
    }
    return LocalNotification.instance;
}

localNotification = LocalNotification.getInstance();

LocalNotification.getLocalTimeZone = function () {
    return - new Date().getTimezoneOffset() / 60
}


/**
 *  @param {Number} timeStamp (in milliseconds)
 *  @param {Number} timeZone1 (current time zone)
 *  @param {Number} timeZone2 (time zone target)
 */
LocalNotification.convertTime = function (timeStamp, timeZone1, timeZone2){
    return new Date(timeStamp + (timeZone2 - timeZone1) * 3600000);
}

var LocalNotificationOffline = cc.Class.extend({
    ctor: function () {
        LocalizedString.add("res/Lobby/LocalizedNotification/notification_en");
    },

    onUserLoginSuccess: function () {
        cc.log("on user login success")
        this.timeLogin = Date.now();
        this.setCallBackLevel1();
        this.setCallBackLevel2();
        this.setCallBackLevel3();
        this.setCallBackLevel4();
        localNotification.showNotify();
    },

    setCallBackLevel1: function () {
        var nextDay = new Date(this.timeLogin);
        nextDay.setDate(nextDay.getDate() + 1);
        nextDay.setHours(19, 0, 0);
        cc.log("time 1", nextDay.getTime(), nextDay)
        localNotification.addNotify(
            nextDay.getTime(),
            LocalizedString.to("CALL_BACK_SUBTEXT"),
            StringUtility.replaceAll(LocalizedString.to("CALL_BACK_CONTENT_TITLE"), "@user", gamedata.userData.userName),
            LocalizedString.to("CALL_BACK_FIRST"));
    },

    setCallBackLevel2: function () {
        var hours = [12, 20];
        for(var i = 0; i < hours.length; i ++){
            var nextDay = new Date(this.timeLogin);
            nextDay.setDate(nextDay.getDate() + 2);
            nextDay.setHours(hours[i], 0, 0, 0);
            cc.log("time 2", nextDay.getTime(), nextDay)
            localNotification.addNotify(
                nextDay.getTime(),
                LocalizedString.to("CALL_BACK_SUBTEXT"),
                StringUtility.replaceAll(LocalizedString.to("CALL_BACK_CONTENT_TITLE"), "@user", gamedata.userData.userName),
                LocalizedString.to("CALL_BACK_SECOND"));
        }
    },

    setCallBackLevel3: function () {
        var hours = [12, 20];
        for(var i = 0; i < hours.length; i ++){
            var nextDay = new Date(this.timeLogin);
            nextDay.setDate(nextDay.getDate() + 3);
            nextDay.setHours(hours[i], 0, 0, 0);
            cc.log("time 3", nextDay.getTime(), nextDay)
            localNotification.addNotify(
                nextDay.getTime(),
                LocalizedString.to("CALL_BACK_SUBTEXT"),
                StringUtility.replaceAll(LocalizedString.to("CALL_BACK_CONTENT_TITLE"), "@user", gamedata.userData.userName),
                LocalizedString.to("CALL_BACK_THIRD"));
        }
    },

    setCallBackLevel4: function () {
        var hours = [12, 20];
        for(var i = 0; i < hours.length; i ++){
            var nextDay = new Date(this.timeLogin);
            nextDay.setDate(nextDay.getDate() + 7);
            nextDay.setHours(hours[i], 0, 0);
            cc.log("time 4", nextDay.getTime(), nextDay)
            localNotification.addNotify(
                nextDay.getTime(),
                LocalizedString.to("CALL_BACK_SUBTEXT"),
                StringUtility.replaceAll(LocalizedString.to("CALL_BACK_CONTENT_TITLE"), "@user", gamedata.userData.userName),
                LocalizedString.to("CALL_BACK_FOURTH"));
        }
    }
})

LocalNotificationOffline.instance = null;
LocalNotificationOffline.getInstance = function () {
    if(!LocalNotificationOffline.instance){
        return new LocalNotificationOffline();
    }
}

var localNotificationOffLine = LocalNotificationOffline.getInstance();