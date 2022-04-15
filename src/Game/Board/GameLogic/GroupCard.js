/**
 * Created by HOANGNGUYEN on 7/28/2015.
 */

var TalaGroupCard = cc.Class.extend({

    ctor: function(cards){
        this.typeGroup= -1;
        this.cards = [];


        for(var i=0;i<cards.length;i++)
        {
            this.cards.push(new Card(cards[i]));
        }

        this.initCards();
    },
    clone: function(){
        var ret = new TalaGroupCard([]);
        ret.typeGroup = this.typeGroup;
        ret.cards = [];
        for(var i=0;i<this.cards.length;i++)
        {
            ret.cards.push(new Card(this.cards[i]));
        }

        return ret;
    },
    initCards: function() {

    },
    putCardIn: function(card){
        this.cards.push(card);
    },
    takeCardOut: function(index){
        var card = new Card(-1);

        if(index >= 0 && index < this.cards.length)
        {
            card = new Card(this.cards[index]);
            this.cards.splice(index,1);
        }

        return card;
    },
    getCard: function(index){
        var card = new Card(-1);
        if(index < this.cards.length)
        {
            card.initWithID(this.cards[index].id);
            card.isEaten = this.cards[index].isEaten;
        }
        return card;
    },
    clearGroup: function(){
        this.cards = [];
    },
    insertCard: function(card,index){
        this.cards.splice(index,0,card);
    },
    getSum: function(){
        var sum = 0;
        for(var i=0;i<this.cards.length;i++)
        {
            sum += this.cards[i].cardType;
        }
        return sum;
    },
    swap2Card: function(ind1,idx2){
        var card = this.cards[ind1];
        this.cards[ind1] = this.cards[idx2];
        this.cards[idx2] = card;
    },
    findCard :function(cardID)
    {
        //cc.log("fuck " + cardID)
        var idx= -1;
        for(var i=0;i<this.cards.length;i++)
        {
            if(this.cards[i].id  == cardID)
            {
                idx = i;
                return idx;
            }
        }
        return -1;
    },
    getNumEatCard : function(){
        var count = 0;
        for(var i=0;i<this.cards.length;i++) {
            if(this.cards[i].isEaten)
                count++;
        }
        return count;
    },
    sortCardTypeDown: function()
    {
        var size = this.cards.length;
        if (size <= 1)
        {
            return;
        }
        for (var i=0;i<size;i++)
        {
            for (var j = i+1;j<size;j++)
            {
                if (this.cards[i].id < this.cards[j].id)
                {
                    this.swap2Card(i,j);
                }
            }
        }
    }

});

TalaGroupCard.kType_UNKOWN = 0;
TalaGroupCard.kType_BOCUNGSO = 1;
TalaGroupCard.kType_BOCUNGCHAT = 2;