var PopupEventFanpage = BaseLayer.extend({
    ctor: function () {
        this._super("PopupEventFanpage");
        this.initWithBinaryFile("PopupEventFanpage.json");
    } ,
    initGUI: function () {
        this.bg = this.getControl("bg");
        this.customButton("btnClose", 0, this.bg);
        this.customButton("btnEnterFanpage", 1, this.bg);
        this.txtTimeEvent = this.getControl("txtTimeEvent", this.bg);
        this.txtTimeEvent.setString("Thời gian: " + PopupEventFanpage.START_DATE.substr(0, 5) + " - " +
        PopupEventFanpage.END_DATE);
    },

    onEnterFinish: function(){
        this.setFog();
    },

    onButtonRelease: function (btn, id) {
        if (id === 1){
            NativeBridge.openFanpage("401519949863382");
        }

        this.onClose();
    }
});

PopupEventFanpage.checkOpenPopup = function(){
    var minDateNum = new Date(PopupEventFanpage.changeFormatTime(PopupEventFanpage.START_DATE)).getTime();
    var maxDateNum = new Date(PopupEventFanpage.changeFormatTime(PopupEventFanpage.END_DATE)).getTime();
    var date = new Date();
    var currentTime = date.getTime();
    var today = date.getDate() + "/" + date.getMonth();
    cc.log("min max " + minDateNum + " " + maxDateNum , today, currentTime, (currentTime < maxDateNum), (currentTime > minDateNum));
    var isInTimeEvent = false;
    if (currentTime < maxDateNum && currentTime > minDateNum) {
        isInTimeEvent = true;
    }

    for (var i = 0; i < PopupEventFanpage.ARRAY_OPEN_DATE.length; i++){
        var dayCheck = new Date(PopupEventFanpage.changeFormatTime(PopupEventFanpage.ARRAY_OPEN_DATE[i])).getTime();
        if (currentTime >= dayCheck && currentTime <= (dayCheck + 86400000)){
            isInTimeEvent = true;
            break;
        }
    }

    if (isInTimeEvent){
        cc.log('trong thoi gian dien ra su kien');
        var keyLocal = "shownPopupEventFanpage_" + today;
        var shownPopupBrand = cc.sys.localStorage.getItem(keyLocal);
        if (shownPopupBrand == null || !shownPopupBrand) {
            sceneMgr.openGUI(PopupEventFanpage.className, PopupEventFanpage.TAG, PopupEventFanpage.TAG);
            cc.sys.localStorage.setItem(keyLocal, 1);
        }
    }
};

PopupEventFanpage.changeFormatTime = function(date){
    var arrTime = date.split("/");
    return arrTime[1] + "/" + arrTime[0] + "/" + arrTime[2];
};

PopupEventFanpage.className = "PopupEventFanpage";
PopupEventFanpage.TAG = 102;

PopupEventFanpage.START_DATE = "21/11/2019";
PopupEventFanpage.END_DATE = "01/12/2019";

PopupEventFanpage.ARRAY_OPEN_DATE = [];
