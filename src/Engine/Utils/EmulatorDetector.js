/**
 * Created by TrungTB on 16/06/2021
 */

var EmulatorDetector = cc.Class.extend({
    ctor: function (callback) {
        this.callback = callback;
        this.emulator = EmulatorDetector.DETECT_NONE;
        this.accelerationListener = null;
        this.accelerationOld = null;
        this.accelerationNumCheck = 0;
        this.accelerationNumNoChange = 0;
        this.arrSample = [];
        this.startTimeCheck = 0;
        this.checkAccelerometer();
    },

    //check may ao bang accelerometer se mat 1 khoang thoi gian.
    //neu chua tung check thi se tam thoi tra ve false va goi check emulator
    checkEmulator: function(callback){
        this.callback = callback;
        if(this.emulator == EmulatorDetector.DETECT_NONE){
            this.checkAccelerometer();
        }
        if(this.emulator == EmulatorDetector.DETECT_EMULATOR){
            if(this.callback)this.callback.call(this, this.emulator == EmulatorDetector.DETECT_EMULATOR);
            return true;
        }
        return false;
    },
    isEmulator: function(){
        return this.checkEmulator();
    },

    checkAccelerometer: function(){
        this.arrSample = [];
        this.accelerationOld = null;
        this.accelerationNumCheck = 0;
        this.accelerationNumNoChange = 0;
        this.startTimeCheck = Date.now();
        if( 'accelerometer' in cc.sys.capabilities){
            this.accelerationListener = cc.eventManager.addListener({
                event: cc.EventListener.ACCELERATION,
                callback: function (accelEvent, event) {
                    var detector = this;
                    var oldAccel = detector.accelerationOld;
                    if(!oldAccel){
                        detector.accelerationOld = accelEvent;
                        this.arrSample.push(accelEvent);
                        return;
                    }
                    this.arrSample.push(accelEvent);
                    this.accelerationNumCheck++;
                    if((accelEvent.x == oldAccel.x && accelEvent.y == oldAccel.y && accelEvent.z == oldAccel.z) ||
                        (accelEvent.x == 0.0 || accelEvent.y == 0.0 || accelEvent.z == 0.0)){
                        detector.accelerationNumNoChange ++;
                    }
                    if(Date.now() - detector.startTimeCheck >= EmulatorDetector.ACCELERATION_MAX_TIME_CHECK &&
                        this.accelerationNumCheck > EmulatorDetector.ACCELERATION_NUM_CHECK){
                        if (detector.accelerationNumNoChange / detector.accelerationNumCheck >= EmulatorDetector.RATE_VIRTUAL_DETECT) {
                            detector.emulator = EmulatorDetector.DETECT_EMULATOR;
                        }
                        else{
                            detector.emulator = EmulatorDetector.DETECT_DEVICE;
                        }
                        detector.finishDetect();
                        return;
                    }

                    detector.accelerationOld = accelEvent;
                }.bind(this)
            }, EmulatorDetector.TAG_LISTENTER);
            this.emulator = EmulatorDetector.DETECTING_WAIT;
            cc.inputManager.setAccelerometerEnabled(true);
        }
        else{
            cc.log("EmulatorDetector no accelerometer");
        }
    },

    finishDetect: function () {
        cc.log("EmulatorDetector finishDetect", this.emulator, Date.now() - this.startTimeCheck,
            this.accelerationNumNoChange, this.accelerationNumCheck, JSON.stringify(this.arrSample));
        //warning: sau khi tat accelerometer, event van ban su kien them khoang chuc event.
        cc.inputManager.setAccelerometerEnabled(false);
        cc.eventManager.removeListener(this.accelerationListener);
        this.accelerationListener = null;
        if(this.callback)this.callback.call(this, this.emulator == EmulatorDetector.DETECT_EMULATOR, this.arrSample);
    }
});


EmulatorDetector.TAG_LISTENTER = 132;
EmulatorDetector.DETECT_NONE = -1;
EmulatorDetector.DETECT_DEVICE = 0;
EmulatorDetector.DETECT_EMULATOR= 1;
EmulatorDetector.DETECTING_WAIT = 2;
//So lan lay du lieu de check
EmulatorDetector.ACCELERATION_MAX_TIME_CHECK = 100;
EmulatorDetector.ACCELERATION_NUM_CHECK = 10;
//ti le detect virtual => emulator
EmulatorDetector.RATE_VIRTUAL_DETECT = 1.0;