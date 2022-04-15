/**
 * Created by sonbnt on 03/12/2021
 */

var TalaSuit = cc.Class.extend({
    ctor: function(cardIds){
        this.cards = [];
        for (var cardId in cardIds)
            this.cards.push(new TalaCard(cardId));
    },

    pushCard: function(card){

    },

    checkCard: function(card){
        if (this.isSameType()) return this.cards[0].getType() == card.getType();
        else {
            if (this.cards[0].getShape() == card.getShape()){
                return this.cards[0].getType() - card.getType() == 1 || card.getType() - this.cards[this.cards.length - 1] == 1;
            }
            else return false;
        }
    },

    isSameType: function(){
        return this.cards[0].getType() == this.cards[1].getType();
    },

    convertToArray: function(){
        this.cardIds = [];
        for (var card in this.cards)
            this.cardIds.push(card.getId());
    }
})