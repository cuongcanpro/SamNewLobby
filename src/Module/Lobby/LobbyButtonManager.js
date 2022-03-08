var LobbyButtonManager = cc.Class.extend({
    ctor: function(){
        this.pButton = null;
        this.buttonMap = {};    //store ref to buttons
        this.buttonArray = [];  //store buttons order
    },

    setPButton: function(pButton){
        this.pButton = pButton;
        this.pButton.removeAllChildren();
        this.pButton.unscheduleAllCallbacks();

        for (var i = 0; i < this.buttonArray.length; i++){
            var type = this.buttonArray[i].type;
            var id = this.buttonArray[i].id;
            var button = this.buttonMap[type][id];
            button.removeFromParent();
            this.pButton.addChild(button);
        }
    },

    scheduleUpdate: function(){
        this.pButton.schedule(this.update.bind(this), 0);
    },

    unscheduleUpdate: function(){
        this.pButton.unscheduleAllCallbacks();
    },

    getButton: function(id, type) {
        if (id == undefined) return null;
        if (this.buttonMap[type] && this.buttonMap[type][id]) return this.buttonMap[type][id];
        return null;
    },

    /**
     * @param {cc.Node} button
     * @param {string} unique id
     * @param {int} type for priority
     */
    addButton: function(button, id, type){
        if (id == undefined) return;
        if (LobbyButtonManager.BUTTON_TYPES.indexOf(type) == -1) type = LobbyButtonManager.TYPE_DEFAULT;

        if (this.buttonMap[type] && this.buttonMap[type][id]) return;
        if (!this.buttonMap[type]) this.buttonMap[type] = {};
        button.retain();
        if (button.getParent()) button.removeFromParent();
        if (this.pButton) this.pButton.addChild(button);
        this.buttonMap[type][id] = button;
        this.buttonArray.push({type: type, id: id});
        this.buttonArray.sort(function(a, b){
            return a.type - b.type;
        });
    },

    /**
     * @param {string} unique id
     * @param {int} type for priority
     */
    removeButton: function(id, type){
        if (id == undefined) return;
        if (LobbyButtonManager.BUTTON_TYPES.indexOf(type) == -1) type = LobbyButtonManager.TYPE_DEFAULT;

        for (var i = 0; i < this.buttonArray.length; i++){
            var button = this.buttonArray[i];
            if (button.type == type && button.id == id){
                if (this.pButton) this.pButton.removeChild(this.buttonMap[type][id]);
                delete this.buttonMap[type][id];
                this.buttonArray.splice(i, 1);
                break;
            }
        }
    },

    update: function(){
        var count = 0;
        for (var i = 0; i < this.buttonArray.length; i++){
            var type = this.buttonArray[i].type;
            var id = this.buttonArray[i].id;
            var button = this.buttonMap[type][id];
            if (!button.isVisible()) continue;
            var row = count % LobbyButtonManager.MAX_ROW;
            var col = Math.floor(count / LobbyButtonManager.MAX_ROW);
            button.setPosition(col * LobbyButtonManager.OFFSET.x, -row * LobbyButtonManager.OFFSET.y);
            count++;
        }
    }
});
LobbyButtonManager.instance = null;
LobbyButtonManager.getInstance = function(){
    if (!LobbyButtonManager.instance)
        LobbyButtonManager.instance = new LobbyButtonManager();
    return LobbyButtonManager.instance;
};
LobbyButtonManager.OFFSET = cc.p(120, 120);
LobbyButtonManager.MAX_ROW = 3;

LobbyButtonManager.BUTTON_TYPES = [
    (LobbyButtonManager.TYPE_OFFER = 0),
    (LobbyButtonManager.TYPE_EVENT = 1),
    (LobbyButtonManager.TYPE_DEFAULT = 100)
];
