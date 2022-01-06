/**
 * Created by cuongleah on 2/24/2016.
 */



var MaubinhCardLogic = cc.Class.extend({
    ctor: function(id){
       this.ID = id;
    },

    GetNumber: function()
    {
        return Math.floor(this.ID / 4) + 2;
    },

    GetSuit: function()
    {
        return (this.ID % 4 + 1);
    },

    SetCard: function(n, s){
    // Convert code Binh
        this.ID = (n - 2) * 4 + (s - 1);
    },

    GetColor: function() {
        // Convert code Binh
        if (this.GetSuit() == MaubinhCardLogic.ES_CLUB || this.GetSuit() == MaubinhCardLogic.ES_SPADE)
            return MaubinhCardLogic.EC_BLACK;
        if (this.GetSuit() == MaubinhCardLogic.ES_DIAMOND || this.GetSuit() == MaubinhCardLogic.ES_HEART)
            return MaubinhCardLogic.EC_RED;
        return MaubinhCardLogic.EC_UNDEFINED;
    }
});
// Card Suit:
MaubinhCardLogic.ES_HEART = 4
MaubinhCardLogic.ES_DIAMOND = 3
MaubinhCardLogic.ES_CLUB = 2
MaubinhCardLogic.ES_SPADE = 1

// Card color:
MaubinhCardLogic.EC_RED = 0
MaubinhCardLogic.EC_BLACK  = 1
MaubinhCardLogic.EC_UNDEFINED = 2