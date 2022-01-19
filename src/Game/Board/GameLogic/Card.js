/**
 * Created by HOANGNGUYEN on 7/28/2015.
 */

    /** Dai dien cho 1 quan bai void id tu 8 -> 60 (60 dai dien cho quan bai up) */
    //  id = quanbai * 4 + chat


var Card = cc.Class.extend({

    ctor: function(id){
       this._id= 0;             // ID cua card ( 8 -> 60)
        this._quanbai= 0;        // quan bai cua card
        this._chat= 0;           // chat cua card
        this.initWithID(id);
    },
    initWithID: function(id){
        this._id = id;
        this._quanbai = Math.floor(id / 4);
        this._chat = id % 4;
    }
});

Card.toString = function(id){
    var quanbai = Math.floor(id / 4);
    var chat = id % 4;

    var _quanbai = "";
    var _chat = "";
    switch(quanbai)
    {
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
        case 10:
            _quanbai = "" + quanbai;
            break;
        case 11:
            _quanbai = "J";
            break;
        case 12:
            _quanbai = "Q";
            break;
        case 13:
            _quanbai = "K";
            break;
        case 14:
            _quanbai = "A";
            break;
    }
    switch (chat)
    {
        case 0:
            _chat = "Bích";
            break;
        case 1:
            _chat = "Chuồn";
            break;
        case 2:
            _chat = "Rô";
            break;
        case 3:
            _chat = "Cơ";
            break;
    }
    return _quanbai+"."+_chat;

};


Card.convertCardID = function(id){                  // from server to client
    var quanbai = Math.floor(id / 4);
    var chat = id % 4;

    var _quanbai = 0;

    switch (quanbai)
    {
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
        case 10:
        case 11:
        {
            _quanbai = quanbai + 3;
            break;
        }
        case 12:
        {
            _quanbai = 2;
            break;
        }
        case 13:
        {
            _quanbai = 15;
            break;
        }
    }
    return _quanbai * 4 + chat;
};

Card.convertToServerCard = function(id){            // from client to server
    var quanbai = Math.floor(id / 4);
    var chat = id % 4;

    var _quanbai = 2;

    switch (quanbai)
    {
        case 2:
        {
            _quanbai = 12;
            break;
        }
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
        case 10:
        case 11:
        case 12:
        case 13:
        case 14:
        {
            _quanbai = quanbai - 3;
            break;
        }
        case 15:
        {
            _quanbai = 13;
            break;
        }
    }
    return _quanbai * 4 + chat;
};


Card.kQuanbai_2 = 2;
Card.kQuanbai_3 = 3;
Card.kQuanbai_4 = 4;
Card.kQuanbai_5 = 5;
Card.kQuanbai_6 = 6;
Card.kQuanbai_7 = 7;
Card.kQuanbai_8 = 8;
Card.kQuanbai_9 = 9;
Card.kQuanbai_10 = 10;
Card.kQuanbai_J = 11;
Card.kQuanbai_Q = 12;
Card.kQuanbai_K = 13;
Card.kQuanbai_A = 14;
Card.kQuanbai_NONE = 15;

Card.kChat_BICH = 0;
Card.kChat_CHUON = 1;
Card.kChat_RO = 2;
Card.kChat_CO = 3;

