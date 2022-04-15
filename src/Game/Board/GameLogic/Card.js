/**
 * Created by HOANGNGUYEN on 7/28/2015.
 */

    /** Dai dien cho 1 quan bai void id tu 8 -> 60 (60 dai dien cho quan bai up) */
    //  id = quanbai * 4 + chat


var Card = cc.Class.extend({

    ctor: function(id){
        if(id instanceof  Card)
        {
            this.id = id.id;
            this.cardType = id.cardType;
            this.cardShape = id.cardShape;
            this.isEaten = id.isEaten;
            this.isInSuit = id.isInSuit;
            this.isSelected = id.isSelected;
            this.isDark = id.isDark;
            return;
        }
        this.id = id;             // ID cua card
        this.cardType= 0;        // quan bai cua card
        this.cardShape= 0;           // chat cua card
        this.initWithID(id);

        this.isEaten = false;
        this.isInSuit = false;
        this.isSelected = false;
        this.isDark = true;

        this.initWithID(id);
    },
    initWithID: function(id){
        this.id = id;
        this.cardType = Math.floor(id / 4);
        this.cardShape = id % 4;
    },
    initWith: function(quanbai,chat){
        this.cardType = quanbai;
        this.cardShape = chat;
        this.id = this.cardType * 4 + this.cardShape;
    },
        clone: function()
        {
            var ret = new Card();
            ret.id = this.id;
            ret.cardShape = this.cardShape;
            ret.cardType = this.cardType;
            ret.isEaten = this.isEaten;
            ret.isInSuit = this.isInSuit;
            ret.isSelected = this.isSelected;
            ret.isDark = this.isDark;

            return ret;
        },
        getType: function(){
            return this.cardType;
        },
        getShape: function()
        {
            return this.cardShape;
        }
});



Card.kQuanbai_A = 0;
Card.kQuanbai_2 = 1;
Card.kQuanbai_3 = 2;
Card.kQuanbai_4 = 3;
Card.kQuanbai_5 = 4;
Card.kQuanbai_6 = 5;
Card.kQuanbai_7 = 6;
Card.kQuanbai_8 = 7;
Card.kQuanbai_9 = 8;
Card.kQuanbai_10 = 9;
Card.kQuanbai_J = 10;
Card.kQuanbai_Q = 11;
Card.kQuanbai_K = 12;
Card.kQuanbai_NONE = 13;

Card.kChat_BICH = 0;
Card.kChat_CHUON = 1;
Card.kChat_RO = 2;
Card.kChat_CO = 3;
Card.kChat_NODE = 4;


