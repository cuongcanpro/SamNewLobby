/**
 * Created by HOANGNGUYEN on 7/28/2015.
 */

var GroupCard = cc.Class.extend({

    ctor: function(cards){
        this._typeGroup= -1;
        this._cards = cards;
        this.initCards();
    },
    initCards: function(){
        if(this._cards.length == 0)
            return;

        this._cards.sort(function(card1,card2){return card1._id - card2._id});      // sort tang dan`

        var size = this._cards.length;
        this._typeGroup = GroupCard.kType_BAIRAC;
        if (size == 1)
        {
            this._typeGroup = GroupCard.kType_BAIRAC;
            return;
        }
        else if(size == 2)
        {
            if ((this._cards[0]._quanbai) == (this._cards[1]._quanbai))
            {
                this._typeGroup = GroupCard.kType_DOI;
                return;
            }
            return;
        }
        else if(size == 3)
        {
            if ((this._cards[0]._quanbai) == (this._cards[1]._quanbai) && (this._cards[2]._quanbai) == (this._cards[1]._quanbai))
            {
                this._typeGroup = GroupCard.kType_BALA;
                return;
            }
        }
        else if(size == 4)
        {
            if ((this._cards[0]._quanbai) == (this._cards[1]._quanbai) && (this._cards[2]._quanbai) == (this._cards[1]._quanbai) && (this._cards[2]._quanbai) == (this._cards[3]._quanbai))
            {
                this._typeGroup = GroupCard.kType_TUQUY;
                return;
            }
        }
        else if(size == 8)
        {
            if ((this._cards[0]._quanbai) == (this._cards[1]._quanbai) && (this._cards[2]._quanbai) == (this._cards[1]._quanbai) && (this._cards[2]._quanbai) == (this._cards[3]._quanbai)
                && (this._cards[4]._quanbai) == (this._cards[5]._quanbai) && (this._cards[5]._quanbai) == (this._cards[6]._quanbai) && (this._cards[6]._quanbai) == (this._cards[7]._quanbai))
            {
                this._typeGroup = GroupCard.kType_DOITUQUY;
                return;
            }
        }

        var sanh = true;
        var quanbai = this._cards[0]._quanbai;
        for (var i=1;i<this._cards.length ;i++)
        {
            if ((this._cards[i]._quanbai - 1) == quanbai)
            {
                quanbai = this._cards[i]._quanbai;
            }
            else
            {
                sanh = false;
                break;
            }
        }
        if (sanh)
        {
            this._typeGroup = GroupCard.kType_SANHDOC;
            return;
        }
        // Kiem tra truong hop sanh doc bat dau tu A
        if ((this._cards[this._cards.length - 1]._quanbai == Card.kQuanbai_A) && (this._cards[0]._quanbai == Card.kQuanbai_2))
        {
            var sanhdoc = true;
            var quan = this._cards[0]._quanbai;
            for (var i=1;i<this._cards.length-1;i++)
            {
                if ((this._cards[i]._quanbai - 1) == quan)
                {
                    quan = this._cards[i]._quanbai;
                }
                else
                {
                    sanhdoc = false;
                    break;
                }
            }
            if (sanhdoc)
            {
                var a = this._cards[this._cards.length - 1];this._cards.pop();
                this._cards.splice(0,0,a);
                this._typeGroup = GroupCard.kType_SANHDOC;
            }

        }
    }
});

GroupCard.kType_UNKOWN = -1;
GroupCard.kType_BAIRAC = 0;
GroupCard.kType_DOI = 1;
GroupCard.kType_BALA = 2;
GroupCard.kType_SANHDOC = 3;
GroupCard.kType_TUQUY = 4;
GroupCard.kType_DOITUQUY = 5;