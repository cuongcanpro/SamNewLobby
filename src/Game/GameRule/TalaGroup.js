/**
 * Created by sonbnt on 03/12/2021
 */

var TalaGroup = cc.Class.extend({
    ctor: function(handOnCards, eatenCards){
        this.cards = [];
        for (var cardId in handOnCards){
            var eaten = eatenCards.indexOf(cardId) != -1;
            this.cards.push(new TalaCard(cardId, eaten));
        }
    },

    putCardIn: function(card){
        this.cards.push(card);
    },

    insertCard: function(card, index){
        this.cards.splice(index, 0, card);
    },

    takeCardOut: function(index){
        var card = this.cards[index];
        this.cards.splice(index, 1);
        return card;
    },

    getCard: function(index){
        return this.cards[index];
    },

    convertToArray: function(){
        this.cardIds = [];
        for (var card in this.cards)
            this.cardIds.push(card.getId());
    },

    convertToTable: function(){
        var table = [];
        for (var i = 0; i < Card.NUM_TYPE; i++){
            table.push([]);
            for (var j = 0; j < Card.NUM_SHAPE; j++)
                table[i].push(new Card(-1));
        }

        for (var card in this.cards)
            table[card.getType()][card.getShape()] = new Card(card.getId(), card.isEaten());

        return table;
    }
});

