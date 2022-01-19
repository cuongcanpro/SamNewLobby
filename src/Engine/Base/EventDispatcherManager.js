/**
 * Created by TrungTB on 12/15/2021.
 * dispatch custom event manager between modules
 * module declare event listener can create default function "onReiceveEvent" to receive event dispatch
 */
var EventDispatcherManager = cc.Class.extend({

    ctor: function () { 
        this.eventList = {};
    },

    /*
    callListener: undefined => default function "onReceiveEvent" of target
        function(strEvent, dataEvent){};
     */
    addListener: function(strEvent, target, callListener) {
        var listener = this.createListener(target, callListener);
        if(this.eventList[strEvent]){
            var listenerList = this.eventList[strEvent];
            //check Exist Listener
            for(var iListen of listenerList){
                if(iListen.target === target){
                    cc.log("Listener is already exist!", strEvent);
                    return false;
                }
            }
            //push listener
            this.eventList[strEvent].push(listener);
        }
        else{   //create event
            this.eventList[strEvent] = [listener];
        }
        return true;
    },

    addListenerList: function (eventList, target, callListener) {
        for(var event of eventList){
            this.addListener(event, target, callListener);
        }
    },

    removeListener: function(strEvent, target){
        var listenerList = this.eventList[strEvent];
        if(listenerList){
            var listener;
            var lenList = listenerList.length;
            for(var i = 0; i < lenList; i++){
                listener = listenerList[i];
                //detect available listener and remove
                if(listener.target === target){
                    listenerList.splice(i, 1);
                    return true;
                }
            }
        }

        cc.log("No listener found!", strEvent);
        return false;
    },

    removeAllListenerByTarget: function(target){
        for (var event in this.eventList) {
            var listenerList = this.eventList[event];
            if (listenerList.length > 0) {
                var listener;
                var lenList = listenerList.length;
                for (var i = 0; i < lenList; i++) {
                    listener = listenerList[i];
                    //detect available listener and remove
                    if (listener.target === target) {
                        listenerList.splice(i, 1);
                    }
                }
            }
        }
    },

    dispatchEvent: function (strEvent, dataEvent) {
        var listenerList = this.eventList[strEvent];
        if(listenerList){
            var listener;
            var lenList = listenerList.length;
            cc.log("Call dispatcher event", strEvent);
            for(var i = 0; i < lenList; i++){
                listener = listenerList[i];
                //detect available listener and remove
                if(!this.checkAvailableListener(listener)){
                    listenerList.splice(i, 1);
                    lenList--;
                    i--;
                    cc.log("Remove 1 invalid listener.", strEvent, listener.target.toString());
                    continue;
                }
                //call
                try {
                    if (listener.callback !== undefined) {
                        if (strEvent.indexOf("_get_") >= 0) {
                            var value = listener.callback.call(listener.target, strEvent, dataEvent);
                            if (value != null)
                                return value;
                        }
                        else {
                            listener.callback.call(listener.target, strEvent, dataEvent);
                        }
                    }
                }
                catch (e) {
                    cc.log("ERROR DISPATCH " + e.stack);
                }
            }
        }
        else{
            cc.log("No listener receive this event", strEvent);
        }
    },

    checkAvailableListener: function (listener) {
        //if object node => check valid
        if(listener.target instanceof cc.Node){
            return cc.sys.isObjectValid(listener.target);
        }
        return true;
    },

    createListener : function(target, callListener){
        //detect use default callback (onReceiveEvent)
        if(callListener === undefined && target.onReceiveEvent)
            callListener = target.onReceiveEvent.bind(target);
        return {
            target: target,
            callback: callListener
        };
    }

});


EventDispatcherManager._instance = null;
EventDispatcherManager.getInstance = function () {
    if (EventDispatcherManager._instance == null) {
        EventDispatcherManager._instance = new EventDispatcherManager();
    }
    return EventDispatcherManager._instance;
};
dispatcherMgr = EventDispatcherManager.getInstance();