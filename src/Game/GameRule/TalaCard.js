/**
 * Created by sonbnt on 03/12/2021
 */

var TalaCard = cc.Class.extend({
    ctor: function(id, eaten){
        this.id = id;
        this.eaten = eaten || false;
    },

    isValid: function(){
        return this.id >= 0;
    },

    isEaten: function(){
        return this.eaten;
    },

    getId: function(){
        return this.id;
    },

    getType: function(){
        return this.id / TalaCard.NUM_SHAPE;
    },

    getShape: function(){
        return this.id % TalaCard.NUM_SHAPE;
    }
});

TalaCard.NUM_TYPE = 13;
TalaCard.NUM_SHAPE = 4;

TalaCard.CardType = {
    _A: 0,
    _2: 1,
    _3: 2,
    _4: 3,
    _5: 4,
    _6: 5,
    _7: 6,
    _8: 7,
    _9: 8,
    _10: 9,
    _J: 10,
    _Q: 11,
    _K: 12
};

TalaCard.CardShape = {
    Spade: 0,       //bich
    Club: 1,        //nhep
    Diamond: 2,     //ro
    Heart: 3        //co
};