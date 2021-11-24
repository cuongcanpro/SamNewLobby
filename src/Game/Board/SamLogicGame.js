/**
 * Created by DuyHung on 1/25/2016.
 */

var TienLenCard = cc.Class.extend({
    ctor: function () {
        this.ID = 0;
    },

    GetNumber: function () {
        return (Math.floor(this.ID / 4) + 3);
    },

    GetSuit: function () {
        return (this.ID % 4 + 1);
    },

    compare: function (card) {
        if (this.GetNumber() > card.GetNumber()) {
            return 1;
        } else if (this.GetNumber() < card.GetNumber()) {
            return -1;
        } else {
            if (this.GetSuit() > card.GetSuit()) {
                return 1;
            } else if (this.GetSuit() < card.GetSuit()) {
                return -1;
            } else {
                return 0;
            }
        }
    }
});

var TienLenGroupCard = cc.Class.extend({
    ctor: function () {
        this.Cards = [];
    },

    GetNumOfCards: function () {
        return this.Cards.length;
    },

    IsSixPair: function () {
        if (this.GetNumOfCards() < 12)
            return false;

        var tempCards;
        tempCards = this.Cards;

        for (var t = 0; t < this.GetNumOfCards() - 1; t++)
            for (var j = t + 1; j < this.GetNumOfCards(); j++) {
                if (tempCards[t].GetNumber() > tempCards[j].GetNumber()) {
                    var temp = tempCards[t].ID;
                    tempCards[t].ID = tempCards[j].ID;
                    tempCards[j].ID = temp;
                }
            }

        if (this.GetNumOfCards() == 12) {
            {
                if (tempCards[0].GetNumber() == tempCards[1].GetNumber()) {
                    if (tempCards[2].GetNumber() == tempCards[3].GetNumber()) {
                        if (tempCards[4].GetNumber() == tempCards[5].GetNumber()) {
                            if (tempCards[6].GetNumber() == tempCards[7].GetNumber()) {
                                if (tempCards[8].GetNumber() == tempCards[9].GetNumber()) {
                                    if (tempCards[10].GetNumber() == tempCards[11].GetNumber()) {
                                        return true;
                                    }
                                }
                            }
                        }

                    }
                }
            }
        }
        return false;
    },

    GetGroupKind: function () {
        if (this.GetNumOfCards() == 0)
            return TienLenGroupCard.EG_NONE;
        if (this.GetNumOfCards() == 1)
            return TienLenGroupCard.EG_ONECARD;

        var tempCards = [];
        tempCards = this.Cards;

        for (var t = 0; t < this.GetNumOfCards() - 1; t++)
            for (var j = t + 1; j < this.GetNumOfCards(); j++) {
                if (tempCards[t].GetNumber() > tempCards[j].GetNumber()) {
                    var temp = tempCards[t].ID;
                    tempCards[t].ID = tempCards[j].ID;
                    tempCards[j].ID = temp;
                }
            }

        if (this.GetNumOfCards() == 6) {
            if (tempCards[0].GetNumber() != 15 &&
                tempCards[1].GetNumber() != 15 &&
                tempCards[2].GetNumber() != 15 &&
                tempCards[3].GetNumber() != 15 &&
                tempCards[4].GetNumber() != 15 &&
                tempCards[5].GetNumber() != 15) {
                if (tempCards[0].GetNumber() == tempCards[1].GetNumber()) {
                    if (tempCards[2].GetNumber() == tempCards[3].GetNumber()) {
                        if (tempCards[4].GetNumber() == tempCards[5].GetNumber()) {
                            if (tempCards[0].GetNumber() + 1 == tempCards[2].GetNumber()) {
                                if (tempCards[3].GetNumber() + 1 == tempCards[4].GetNumber()) {
                                    return TienLenGroupCard.EG_BIGGER;
                                }
                            }
                        }

                    }
                }
            }
        }
        // Check for super group card:
        if (this.GetNumOfCards() == 8) {
            if (tempCards[0].GetNumber() != 15 &&
                tempCards[1].GetNumber() != 15 &&
                tempCards[2].GetNumber() != 15 &&
                tempCards[3].GetNumber() != 15 &&
                tempCards[4].GetNumber() != 15 &&
                tempCards[5].GetNumber() != 15 &&
                tempCards[6].GetNumber() != 15 &&
                tempCards[7].GetNumber() != 15) {
                // Check if there are four two-cards groupcards:
                if (tempCards[0].GetNumber() == tempCards[1].GetNumber()) {
                    if (tempCards[2].GetNumber() == tempCards[3].GetNumber()) {
                        if (tempCards[4].GetNumber() == tempCards[5].GetNumber()) {
                            if (tempCards[6].GetNumber() == tempCards[7].GetNumber()) {
                                if (tempCards[0].GetNumber() + 1 == tempCards[2].GetNumber()) {
                                    if (tempCards[3].GetNumber() + 1 == tempCards[4].GetNumber()) {
                                        if (tempCards[5].GetNumber() + 1 == tempCards[6].GetNumber()) {
                                            return TienLenGroupCard.EG_SUPER;
                                        }
                                    }
                                }
                            }
                        }

                    }
                }
            }
        } else if (this.GetNumOfCards() == 10) {
            if (tempCards[0].GetNumber() != 15 &&
                tempCards[1].GetNumber() != 15 &&
                tempCards[2].GetNumber() != 15 &&
                tempCards[3].GetNumber() != 15 &&
                tempCards[4].GetNumber() != 15 &&
                tempCards[5].GetNumber() != 15 &&
                tempCards[6].GetNumber() != 15 &&
                tempCards[7].GetNumber() != 15 &&
                tempCards[8].GetNumber() != 15 &&
                tempCards[9].GetNumber() != 15) {
                if (tempCards[0].GetNumber() == tempCards[1].GetNumber()) {
                    if (tempCards[2].GetNumber() == tempCards[3].GetNumber()) {
                        if (tempCards[4].GetNumber() == tempCards[5].GetNumber()) {
                            if (tempCards[6].GetNumber() == tempCards[7].GetNumber()) {
                                if (tempCards[8].GetNumber() == tempCards[9].GetNumber()) {
                                    if (tempCards[0].GetNumber() + 1 == tempCards[2].GetNumber()) {
                                        if (tempCards[3].GetNumber() + 1 == tempCards[4].GetNumber()) {
                                            if (tempCards[5].GetNumber() + 1 == tempCards[6].GetNumber()) {
                                                if (tempCards[7].GetNumber() + 1 == tempCards[8].GetNumber()) {
                                                    return TienLenGroupCard.EG_ULTRA;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                    }
                }
            }
        }

        var Number;
        var Normal = true;
        Number = this.Cards[0].GetNumber();
        for (var i = 0; i < this.GetNumOfCards(); i++) {
            if (this.Cards[i].GetNumber() != Number)
                Normal = false;
        }
        if (Normal && this.GetNumOfCards() == 2) {
            return TienLenGroupCard.EG_NORMAL;
        }

        if (Normal && this.GetNumOfCards() <= 4 && this.GetNumOfCards() >= 3)
            return TienLenGroupCard.EG_NORMAL;

        if (this.GetNumOfCards() < 3)
            return TienLenGroupCard.EG_NONE;

        var Suit;
        var Sequence = true;

        for (var i = 0; i < this.GetNumOfCards() - 1; i++)
            for (var j = i + 1; j < this.GetNumOfCards(); j++) {
                if (this.Cards[i].GetNumber() > this.Cards[j].GetNumber()) {
                    var temp = this.Cards[i].ID;
                    this.Cards[i].ID = this.Cards[j].ID;
                    this.Cards[j].ID = temp;
                }
            }

        Number = this.Cards[0].GetNumber();
        Suit = this.Cards[0].GetSuit();

        if (Number == 15)
            Sequence = false;

        for (i = 1; i < this.GetNumOfCards(); i++) {
            if (this.Cards[i].GetNumber() != Number + i)
                Sequence = false;
            if (this.Cards[i].GetNumber() == 15)
                Sequence = false;

        }
        if (Sequence)
            return TienLenGroupCard.EG_SEQUENCE;
        else
            return TienLenGroupCard.EG_NONE;

    },

    GetNumber: function () {
        if (this.GetNumOfCards() == 0)
            return -1;
        if (this.GetGroupKind() == TienLenGroupCard.EG_ONECARD || this.GetGroupKind() == TienLenGroupCard.EG_NORMAL || this.GetGroupKind() == TienLenGroupCard.EG_SEQUENCE)
            return this.Cards[0].GetNumber();
        if (this.GetGroupKind() == TienLenGroupCard.EG_BIGGER || this.GetGroupKind() == TienLenGroupCard.EG_SUPER || this.GetGroupKind() == TienLenGroupCard.EG_ULTRA) {
            var BiggestNumber = 0;
            for (var i = 0; i < this.Cards.length; i++) {
                if (BiggestNumber < this.Cards[i].GetNumber()) {
                    BiggestNumber = this.Cards[i].GetNumber();
                    return BiggestNumber;
                }
            }
        }
        return -1;

    },

    GetSuit: function () {
        if (this.GetNumOfCards() == 0)
            return 0;
        var SuitNumber = 0;
        for (var i = 0; i < this.Cards.length; i++) {
            SuitNumber += this.Cards[i].GetSuit();
        }
        return SuitNumber;
    },

    GetBiggestSuit: function () {
        if (this.GetNumOfCards() == 0)
            return 0;
        var SuitNumber = 0;
        if (this.GetGroupKind() == TienLenGroupCard.EG_ONECARD) {
            SuitNumber = this.Cards[0].GetSuit();
        } else if (this.GetGroupKind() == TienLenGroupCard.EG_NORMAL) {
            var tempCards = this.Cards;

            for (var t = 0; t < this.GetNumOfCards() - 1; t++)
                for (var j = t + 1; j < this.GetNumOfCards(); j++) {
                    if (tempCards[t].GetSuit() < tempCards[j].GetSuit()) {
                        var temp = tempCards[t].ID;
                        tempCards[t].ID = tempCards[j].ID;
                        tempCards[j].ID = temp;
                    }
                }
            return tempCards[0].GetSuit();
        } else if (this.GetGroupKind() == TienLenGroupCard.EG_SEQUENCE || this.GetGroupKind() == TienLenGroupCard.EG_SUPER || this.GetGroupKind() == TienLenGroupCard.EG_BIGGER || this.GetGroupKind() == TienLenGroupCard.EG_ULTRA) {
            var tempCards = this.Cards;
            for (var t = 0; t < this.GetNumOfCards() - 1; t++)
                for (var j = t + 1; j < this.GetNumOfCards(); j++) {
                    if (tempCards[t].GetNumber() < tempCards[j].GetNumber()) {
                        var temp = tempCards[t].ID;
                        tempCards[t].ID = tempCards[j].ID;
                        tempCards[j].ID = temp;
                    }
                }
            return tempCards[0].GetSuit();
        }
        return SuitNumber;
    },

    AddCard: function (card) {
        this.Cards.push(card);
    },

    RemoveCard: function (card) {
        if (this.GetNumOfCards() == 0)
            return;
        for (var i = 0; i < this.Cards.length; i++) {
            if (this.Cards[i].ID == card.ID) {
                if (i = 0) {
                    this.Cards.splice(0, 1);
                }
                else {
                    this.Cards.splice(i - 1, 1);
                }
            }
        }
    },

    Has3Spade: function () {
        if (this.GetNumOfCards() == 0)
            return false;
        for (var i = 0; i < this.Cards.length; i++) {
            if (this.Cards[i].ID == 0)
                return true;
        }
        return false;
    },

    Has2: function () {
        if (this.GetNumOfCards() == 0)
            return false;
        for (var i = 0; i < this.Cards.length; i++) {
            if (this.Cards[i].GetNumber() == 15)
                return true;
        }
        return false;
    },

    HasTuQuy: function () {
        if (this.GetNumOfCards() != 4)
            return false;
        for (var i = 0; i < 3; i++) {
            if (this.Cards[i].GetNumber() != this.Cards[i + 1].GetNumber())
                return false;
        }
        return true;
    },

    HasDoiThong: function () {
        var groupKind = this.GetGroupKind();
        return !!(groupKind == TienLenGroupCard.EG_BIGGER || groupKind == TienLenGroupCard.EG_SUPER || groupKind == TienLenGroupCard.EG_ULTRA);

    },

    getListId: function () {

        var arrId = [];
        for (var i = 0; i < this.Cards.length; i++) {
            arrId.push(this.Cards[i].ID);
        }
        return arrId;
    },


    searchCard: function (card) {
        for (var i = 0; i < this.Cards.length; i++) {
            if (this.Cards[i].ID == card.ID) {
                return true;
            }
        }
        return false;
    },

    addCardInHead: function (card) {
        var TempCards = [];
        for (var i = 0; i < this.Cards.length; i++) {
            TempCards.push(this.Cards[i]);
        }

        this.Cards = [];
        this.Cards.push(card);
        for (var i = 0; i < TempCards.length; i++) {
            this.Cards.push(TempCards[i]);
        }
    },

    Sort: function (inc) {
        for (var i = 0; i < this.Cards.length; i++) {
            for (var j = i; j < this.Cards.length; j++) {
                if ((inc && this.Cards[j].compare(this.Cards[i]) < 0) || (!inc && (this.Cards[j].compare(this.Cards[i]) > 0))) {
                    var tmp = this.Cards[i];
                    this.Cards[i] = this.Cards[j];
                    this.Cards[j] = tmp;
                }
            }
        }
    },

    GetCountCard: function (number) {
        if (this.GetNumOfCards() == 0)
            return -1;
        var count = 0;
        for (var i = 0; i < this.Cards.length; i++) {
            if (number == this.Cards[i].GetNumber()) {
                ++count;
            }
        }
        return count;
    },

    GetMaxID: function () {
        if (this.GetNumOfCards() == 0)
            return -1;
        var BiggestID = -1;
        for (var i = 0; i < this.Cards.length; i++) {
            if (BiggestID < this.Cards[i].ID) {
                BiggestID = this.Cards[i].ID;
            }
        }
        return BiggestID;
    },

    GetMinID: function () {
        if (this.GetNumOfCards() == 0)
            return -1;
        var MinID = 52; // ID quan bai tu 0 den 51
        for (var i = 0; i < this.Cards.length; i++) {
            if (MinID > this.Cards[i].ID) {
                MinID = this.Cards[i].ID;
            }
        }
        return MinID;
    },

    GetMaxNumber: function () {
        if (this.GetNumOfCards() == 0)
            return -1;
        var BiggestID = -1;
        for (var i = 0; i < this.Cards.length; i++) {
            if (BiggestID < this.Cards[i].GetNumber()) {
                BiggestID = this.Cards[i].GetNumber();
            }
        }
        return BiggestID;
    },

    GetMinNumber: function () {
        if (this.GetNumOfCards() == 0)
            return -1;
        var MinNumBer = 16;
        for (var i = 0; i < this.Cards.length; i++) {
            if (MinNumBer > this.Cards[i].GetNumber()) {
                MinNumBer = this.Cards[i].GetNumber();
            }
        }
        return MinNumBer;
    },

    RemoveAllCards: function () {
        while (this.GetNumOfCards() > 0)
            this.Cards = [];
    },

    CheckDoubleCardID: function (ID) {
        for (var i = 0; i < this.Cards.length; i++) {
            if (this.Cards[i].ID == ID) {
                return true;
            }
        }
        return false;
    },

    CheckDoubleCardNumber: function (num) {
        for (var i = 0; i < this.Cards.length; i++) {
            if (this.Cards[i].GetNumber() == num) {
                return true;
            }
        }
        return false;
    },

    toString: function () {
        return "No cards";
    },

    setCard: function (id) {
        this.Cards = [];
        for (var i = 0; i < id.length; i++) {
            var card = new TienLenCard();
            card.ID = id[i];
            this.Cards.push(card);
        }
    },

    addCardToTest: function () {
        var listRandomCards = [];
        for (var i = 0; i < 52; i++) {
            var card = new TienLenCard();
            card.ID = i;
            listRandomCards.push(card);
        }

        var limit = 51;
        for (var i = 0; i < 13; i++) {
            var rand1 = Math.random() % limit;
            limit--;
            this.Cards.push(listRandomCards[rand1]);
            if (rand1 > 0)
                listRandomCards.splice(rand1 - 1, 1);
            else
                listRandomCards.splice(0, 1);
        }
    },

    addCardWithIDs: function (arrID) {

        for (var i = 0; i < arrID.length; i++) {
            var card = new TienLenCard();
            card.ID = arrID[i];
            this.Cards.push(card);
        }
    },

    getTypeGroupCard: function () {
        var result = this.GetGroupKind();
        if (result == TienLenGroupCard.EG_SUPER || result == TienLenGroupCard.EG_ULTRA || result == TienLenGroupCard.EG_BIGGER)
            return result;

        if (this.HasTuQuy())
            return TienLenGroupCard.EG_TU_QUY;

        var count = 0;
        for (var i = 0; i < this.Cards.length; i++) {
            if (this.Cards[i].ID > 47 && this.Cards[i].ID < 52)
                count++;
        }
        if (count == 2)
            return TienLenGroupCard.EG_DOI_HAI;

        if (count == 3)
            return TienLenGroupCard.EG_BA_CON_HAI;

        return TienLenGroupCard.EG_NONE;
    }

});

var TienLenPlayerCard = cc.Class.extend({
    ctor: function () {
        this.GroupCards = [];
        this.Value = [];
    },

    getListIdCard: function () {
        var arrIdCard = [];

        for (var i = 0; i < this.GroupCards.length; i++) {
            var cards = this.GroupCards[i].Cards;
            for (var j = 0; j < cards.length; j++) {
                arrIdCard.push(cards[j].ID);
            }
        }
        return arrIdCard;
    },

    GetNumOfGroupCards: function () {
        return this.GroupCards.length;
    },

    Has3Spade: function () {
        if (this.GetNumOfGroupCards() == 0)
            return false;
        for (var i = 0; i < this.GetNumOfGroupCards(); i++) {
            for (var j = 0; j < this.GroupCards[i].GetNumOfCards(); j++) {
                if (this.GroupCards[i].Cards[j].ID == 0)
                    return true;
            }
        }
        return false;
    },

    AddGroupCard: function (GCard) {
        this.GroupCards.push(GCard);
    },

    SetCard: function (id) {
        this.GroupCards = [];

        for (var i = 0; i < id.length; i++) {
            var groupCard = new TienLenGroupCard();
            var array1 = [];
            array1.push(id[i]);
            groupCard.setCard(array1);
            this.GroupCards.push(groupCard);
        }
        TienLenGameLogic.ScanGroupCard(this, TienLenGameLogic.AM_NORMAL);
    },

    RemoveGroupCard: function (GCard) {
        for (var i = 0; i < this.GetNumOfGroupCards(); i++) {
            for (var j = 0; j < this.GroupCards[i].GetNumOfCards(); j++) {
                for (var k = 0; k < GCard.GetNumOfCards(); k++) {
                    if (this.GroupCards[i].Cards[j].ID == GCard.Cards[k].ID) {
                        this.GroupCards[i].Cards = [];
                    }
                }
            }
        }
        for (var i = 0; i < this.GetNumOfGroupCards(); i++) {
            if (this.GroupCards[i].GetNumOfCards() == 0) {
                if (i > 0)
                    this.GroupCards.splice(i, 1);
                else
                    this.GroupCards.splice(0, 1);
            }
        }
    },

    SearchCard: function (Card) {
        for (var i = 0; i < this.GetNumOfGroupCards(); i++) {
            for (var j = 0; j < this.GroupCards[i].GetNumOfCards(); j++) {
                if (this.GroupCards[i].Cards[j].ID == Card.ID) {
                    return i;
                }
            }
        }
        return -1;
    },

    GetCard: function (id) {
        if (this.GetNumOfGroupCards() == 0)
            return null;
        for (var i = 0; i < this.GetNumOfGroupCards(); i++) {
            for (var j = 0; j < this.GroupCards[i].GetNumOfCards(); j++) {
                if (this.GroupCards[i].Cards[j].ID == id) {
                    return this.GroupCards[i].Cards[j];
                }
            }
        }
        return null;
    },

    Clear: function () {
        this.GroupCards = [];
    },

    Leave2Last: function () {
        var alltwo = true;
        if (this.GetNumOfGroupCards() == 0) {
            alltwo = false;
        }

        for (var i = 0; i < this.GroupCards.length; i++)
            for (var j = 0; j < this.GroupCards[i].Cards.length; j++) {
                if (this.GroupCards[i].GetNumber() != 15) {
                    return false;
                }
            }

        return alltwo;
    },

    HasStraight: function () {
        var check2 = false;
        var v;
        for (var i = 0; i < this.GetNumOfGroupCards(); i++) {
            for (var j = 0; j < this.GroupCards[i].GetNumOfCards(); j++) {
                v.push(this.GroupCards[i].Cards[j].GetNumber());
                if (this.GroupCards[i].Cards[j].GetNumber() == 15)
                    check2 = true;
            }
        }

        var demCards = [];
        for (var i = 0; i < v.length; i++) {
            var dem = 1;
            for (var j = 0; j < v.length; j++) {
                if (j != i && (v[i] == v[j])) {
                    ++dem;
                }
            }
            demCards.push(dem);
        }

        var k = 0;
        for (var i = 0; i < demCards.length; i++) {
            if (check2) {
                if (demCards[i] >= 2) {
                    return false;
                }
            } else {
                if (demCards[i] > 2) {
                    return false;
                }
                if (demCards[i] == 2)
                    k++;
            }
        }
        return k < 3;

    },

    HasFour2: function () {
        var dem = 0;
        for (var i = 0; i < this.GetNumOfGroupCards(); i++) {
            for (var j = 0; j < this.GroupCards[i].GetNumOfCards(); j++) {
                if (this.GroupCards[i].Cards[j].GetNumber() == 15)
                    dem++;
            }
        }

        return dem == 4;
    },

    HasFour3: function () {
        var dem = 0;
        for (var i = 0; i < this.GetNumOfGroupCards(); i++) {
            for (var j = 0; j < this.GroupCards[i].GetNumOfCards(); j++) {
                if (this.GroupCards[i].Cards[j].GetNumber() == 3)
                    dem++;
            }
        }

        return dem == 4;
    },

    Has4DoiThongDefault: function () {
        var doi = [];
        var ID = [];
        var countCard = 0;
        var k = 0;
        var v = 0;
        var j = 0;
        for (var i = 0; i < this.GetNumOfGroupCards(); i++) {
            for (j = 0; j < this.GroupCards[i].GetNumOfCards(); j++) {
                countCard++;
            }
        }
        if (countCard < 8)
            return false;

        for (var i = 0; i < 20; i++)
            doi[i] = 0;

        for (var i = 0; i < 6; i++)
            ID[i] = 0;

        for (var i = 0; i < this.GetNumOfGroupCards(); i++) {
            for (j = 0; j < this.GroupCards[i].GetNumOfCards(); j++) {
                if (this.GroupCards[i].Cards[j].GetNumber() != 15) {
                    var index = this.GroupCards[i].Cards[j].GetNumber();
                    if (index >= 0 && index < 20) {
                        doi[index]++;
                        if (doi[index] == 2) {
                            k++;
                            ID[v++] = index;
                        }
                    }

                }
            }
        }

        if (k >= 4) {
            for (var i = 0; i < 5; i++)
                for (v = i + 1; v < 6; v++)
                    if (ID[i] < ID[v]) {
                        var temp = ID[i];
                        ID[i] = ID[v];
                        ID[v] = temp;
                    }
            for (var i = 0; i < 3; i++)
                if (ID[i] > 0) {
                    if (ID[i] - ID[i + 3] == 3) {

                        this.Value = [];

                        for (j = ID[i]; j >= ID[i + 3]; j--) {

                            this.Value.push(j);
                        }

                        return true;
                    }
                }
        }
        return false;
    },

    Has3DoiThongDefault: function () {
        var doi = [];
        var ID = [];
        var countCard = 0;
        var k = 0;
        var v = 0;
        var i = 0;
        var j = 0;
        for (i = 0; i < this.GetNumOfGroupCards(); i++) {
            for (j = 0; j < this.GroupCards[i].GetNumOfCards(); j++) {
                countCard++;
            }
        }
        if (countCard < 6)
            return false;

        for (i = 0; i < 20; i++)
            doi[i] = 0;

        for (i = 0; i < 6; i++)
            ID[i] = 0;

        for (i = 0; i < this.GetNumOfGroupCards(); i++) {
            for (j = 0; j < this.GroupCards[i].GetNumOfCards(); j++) {
                if (this.GroupCards[i].Cards[j].GetNumber() != 15) {
                    var index = this.GroupCards[i].Cards[j].GetNumber();
                    if (index >= 0 && index < 20) {
                        doi[index]++;
                        if (doi[index] == 2) {
                            k++;
                            ID[v++] = index;
                        }
                    }

                }
            }
        }

        if (k >= 3) {
            for (i = 0; i < 5; i++)
                for (v = i + 1; v < 6; v++)
                    if (ID[i] < ID[v]) {
                        var temp = ID[i];
                        ID[i] = ID[v];
                        ID[v] = temp;
                    }

            for (i = 0; i < 4; i++)
                if (ID[i] > 0) {
                    if (ID[i] - ID[i + 2] == 2) {
                        this.Value = [];
                        for (j = ID[i]; j >= ID[i + 2]; j--)
                            this.Value.push(j);
                        return true;
                    }
                }
        }
        return false;
    },

    HasUltra: function () {
        var doi = [];
        var ID = [];
        var i, j = 0, k = 0;

        for (i = 0; i < this.GroupCards.length; i++) {
            for (j = 0; j < this.GroupCards[i].Cards.length; j++) {
                if (this.GroupCards[i].Cards[j].GetNumber() != 15) {
                    var index = this.GroupCards[i].Cards[j].GetNumber();
                    if (index >= 0 && index < 20) {
                        doi[index]++;
                        if (doi[index] == 2) {
                            k++;
                            ID[j++] = index;
                        }
                    }
                }
            }
        }
        if (k >= 5) {
            for (i = 0; i < 5; i++)
                for (j = i + 1; j < 6; j++)
                    if (ID[i] < ID[j]) {
                        var temp = ID[i];
                        ID[i] = ID[j];
                        ID[j] = temp;
                    }
            for (i = 0; i < 2; i++)
                if (ID[i] > 0) {
                    if (ID[i] - ID[i + 4] == 4) {

                        this.Value = [];
                        for (j = ID[i]; j >= ID[i + 4]; j--)
                            this.Value.push(j);
                        return true;
                    }
                }
        }
        return false;
    },

    HasPair: function (LastCards, ChooseCards, PlayerCards) {
        if (LastCards.GetNumOfCards() > 0) {
            if (LastCards.GetGroupKind() != TienLenGroupCard.EG_NORMAL && LastCards.GetNumOfCards() != 2)
                return null;
        } else if (ChooseCards.GetGroupKind() != TienLenGroupCard.EG_NORMAL)
            return null;
        var ID = this.GetCardNumber(ChooseCards.GetNumber());
        if (ID.length < 2)
            return null;
        else {
            var Pair = new TienLenGroupCard();
            for (var z = 0; z < ChooseCards.GetNumOfCards(); z++) {
                Pair.AddCard(ChooseCards.Cards[z]);
            }
            for (var i = 0; i < ID.length; i++) {
                if (Pair.CheckDoubleCardID(ID[i]))
                    continue;
                if (LastCards.GetNumOfCards() > 0) {
                    if (LastCards.GetMaxID() > ID[i] && LastCards.GetMaxID() > Pair.GetMaxID())
                        continue;
                }
                if (Pair.GetNumOfCards() < 2)
                    Pair.AddCard(this.GetCard(ID[i]));
            }
            if (Pair.GetNumOfCards() == 2) {
                if (LastCards.GetNumOfCards() > 0) {
                    var resultInt = TienLenRule.CheckValidCard(LastCards, Pair, PlayerCards);
                    if (resultInt == TienLenRule.E_NO_ERROR) {
                        return Pair;
                    }
                } else {
                    return Pair;
                }
            }
            return null;
        }
    },

    HasTrio: function (LastCards, ChooseCards, PlayerCards) {
        if (LastCards.GetNumOfCards() > 0) {
            if (LastCards.GetGroupKind() == TienLenGroupCard.EG_NORMAL && LastCards.GetNumOfCards() != 3)
                return null;
        } else if (ChooseCards.GetGroupKind() != TienLenGroupCard.EG_NORMAL)

            return null;


        var ID = this.GetCardNumber(ChooseCards.GetNumber());
        if (ID.length < 3)
            return null;
        else {
            var Trio = new TienLenGroupCard();
            for (var z = 0; z < ChooseCards.GetNumOfCards(); z++) {
                Trio.AddCard(ChooseCards.Cards[z]);
            }
            for (var i = 0; i < ID.length; i++) {
                if (Trio.CheckDoubleCardID(ID[i]))
                    continue;
                if (LastCards.GetNumOfCards() > 0) {
                    if (LastCards.GetMaxID() > ID[i] && LastCards.GetMaxID() > Trio.GetMaxID())
                        continue;
                }
                if (Trio.GetNumOfCards() < 3)
                    Trio.AddCard(this.GetCard(ID[i]));
            }
            if (LastCards.GetNumOfCards() > 0) {
                var resultInt = TienLenRule.CheckValidCard(LastCards, Trio, PlayerCards);
                if (resultInt == TienLenRule.E_NO_ERROR)
                    return Trio;
                return null;
            } else {
                if (Trio.GetNumOfCards() == 3)
                    return Trio;
                return null;
            }
        }
    },

    Has3DoiThong: function (LastCards, ChooseCards, PlayerCards) {
        if (LastCards === undefined && ChooseCards === undefined && PlayerCards === undefined) {
            return this.Has3DoiThongDefault();
        }

        if (LastCards.GetNumOfCards() > 0) {
            if (LastCards.GetNumOfCards() == 1 && LastCards.GetNumber() != 15)
                return null;
            if (LastCards.GetNumOfCards() > 1)
                if (LastCards.GetGroupKind() != TienLenGroupCard.EG_BIGGER)
                    return null;
        }
        var doi = [];
        var ID = [];
        var i;
        var j = 0;
        var k = 0;
        for (i = 0; i < 20; i++)
            doi[i] = 0;
        for (i = 0; i < this.GetNumOfGroupCards(); i++) {
            for (var s = 0; s < this.GroupCards[i].GetNumOfCards(); s++) {
                var index = this.GroupCards[i].Cards[s].GetNumber();
                if (index != 15) {
                    if (index >= 0 && index < 20) {
                        doi[index]++;
                        if (doi[index] == 2) // doi
                        {
                            k++;
                            ID[j++] = index;
                        }
                    }
                }
            }
        }
        if (k >= 3) {
            for (i = 0; i < 5; i++)
                for (j = i + 1; j < 6; j++)
                    if (ID[i] < ID[j]) {
                        var temp = ID[i];
                        ID[i] = ID[j];
                        ID[j] = temp;
                    }

            var BaDoiThong = [];
            for (i = 0; i < 4; i++) {
                if (ID[i] > 0) {
                    if (ID[i] - ID[i + 2] == 2) {
                        var DoiThong = new TienLenGroupCard();
                        var result = false;
                        for (var z = 0; z < ChooseCards.GetNumOfCards(); z++) {
                            result = false;
                            DoiThong.AddCard(ChooseCards.Cards[z]);

                            for (var x = i; x < i + 3; x++) {
                                if (ID[x] == ChooseCards.Cards[z].GetNumber()) {
                                    result = true;
                                }
                            }
                            if (!result) {
                                DoiThong.RemoveAllCards();
                                break;
                            }
                        }
                        if (result) {
                            for (var a = i; a < i + 3; a++) {
                                var group = this.GetCardNumber(ID[a]);

                                for (var c = 0; c < group.length; c++) {
                                    if (DoiThong.CheckDoubleCardID(group[c]))

                                        continue;
                                    if (LastCards.GetNumOfCards() > 1) {
                                        if (LastCards.GetMaxNumber() == ID[a]) {
                                            if (LastCards.GetMaxID() > group[c] && LastCards.GetMaxID() > DoiThong.GetMaxID()) {
                                                continue;
                                            }
                                        }
                                    }
                                    if (DoiThong.GetCountCard(this.GetCard(group[c]).GetNumber()) < 2) {
                                        DoiThong.AddCard(this.GetCard(group[c]));
                                    }
                                }
                            }
                            BaDoiThong.push(DoiThong);
                        }
                    }
                }
            }
            if (LastCards.GetNumOfCards() > 0) {
                for (var ii = BaDoiThong.length - 1; ii >= 0; ii--) {
                    var resultInt = TienLenRule.CheckValidCard(LastCards, BaDoiThong[ii], PlayerCards);
                    if (resultInt == TienLenRule.E_NO_ERROR)
                        return BaDoiThong[ii];
                }
            } else if (BaDoiThong.length > 0)
                return BaDoiThong[BaDoiThong.length - 1];
        }
        return null;
    },

    HasFour: function (LastCards, ChooseCards, PlayerCards) {
        if (LastCards.GetNumOfCards() > 0) {
            if ((LastCards.GetNumOfCards() == 1 || LastCards.GetNumOfCards() == 2) && LastCards.GetNumber() != 15)
                return null;
            if (LastCards.GetNumOfCards() > 2)
                if (LastCards.GetGroupKind() != TienLenGroupCard.EG_BIGGER || LastCards.GetGroupKind() != TienLenGroupCard.EG_SUPER)
                    return null;
        } else if (ChooseCards.GetGroupKind() != TienLenGroupCard.EG_NORMAL)
            return null;
        var ID = this.GetCardNumber(ChooseCards.GetNumber());
        if (ID.length < 4)
            return null;
        else {
            var Four = new TienLenGroupCard();
            for (var i = 0; i < ID.length; i++) {
                Four.AddCard(this.GetCard(ID[i]));
            }
            if (LastCards.GetNumOfCards() > 0) {
                var resultInt = TienLenRule.CheckValidCard(LastCards, Four, PlayerCards);
                if (resultInt == TienLenRule.E_NO_ERROR)
                    return Four;
                return null;
            } else {
                if (Four.GetNumOfCards() == 4)
                    return Four;
                return null;
            }
        }
    },

    Has4DoiThong: function (LastCards, ChooseCards, PlayerCards) {
        if (LastCards === undefined && ChooseCards === undefined && PlayerCards === undefined) {
            return this.Has4DoiThongDefault();
        }

        if (LastCards.GetNumOfCards() > 0) {
            if ((LastCards.GetNumOfCards() == 1 || LastCards.GetNumOfCards() == 2) && LastCards.GetNumber() != 15)
                return null;
            if (LastCards.GetNumOfCards() > 2) {
                if (LastCards.GetGroupKind() != TienLenGroupCard.EG_BIGGER || LastCards.GetGroupKind() != TienLenGroupCard.EG_SUPER)
                    return null;
            }
        }
        var doi = [];
        var ID = [];
        var i;
        var j = 0;
        var k = 0;
        for (i = 0; i < 20; i++)
            doi[i] = 0;
        for (i = 0; i < this.GetNumOfGroupCards(); i++) {
            for (var s = 0; s < this.GroupCards[i].GetNumOfCards(); s++) {
                var index = this.GroupCards[i].Cards[s].GetNumber();
                if (index != 15) {
                    if (index >= 0 && index < 20) {
                        doi[index]++;
                        if (doi[index] == 2) {
                            k++;
                            ID[j++] = index;
                        }
                    }
                }
            }
        }
        if (k >= 4) {
            for (i = 0; i < 5; i++)
                for (j = i + 1; j < 6; j++)
                    if (ID[i] < ID[j]) {
                        var temp = ID[i];
                        ID[i] = ID[j];
                        ID[j] = temp;
                    }

            var BonDoiThong = [];
            for (i = 0; i < 3; i++) {
                if (ID[i] > 0) {
                    if (ID[i] - ID[i + 3] == 3) {
                        var DoiThong = new TienLenGroupCard();
                        var result = false;
                        for (var z = 0; z < ChooseCards.GetNumOfCards(); z++) {
                            result = false;
                            DoiThong.AddCard(ChooseCards.Cards[z]);

                            for (var x = i; x < i + 4; x++) {
                                if (ID[x] == ChooseCards.Cards[z].GetNumber()) {
                                    result = true;
                                }
                            }
                            if (!result) {
                                DoiThong.RemoveAllCards();
                                break;
                            }
                        }
                        if (result) {
                            for (var a = i; a < i + 4; a++) {
                                var group = this.GetCardNumber(ID[a]);

                                for (var c = 0; c < group.length; c++) {
                                    if (DoiThong.CheckDoubleCardID(group[c]))
                                        continue;
                                    if (LastCards.GetNumOfCards() > 6) {
                                        if (LastCards.GetMaxNumber() == ID[a]) {
                                            if (LastCards.GetMaxID() > group[c] && LastCards.GetMaxID() > DoiThong.GetMaxID())
                                                continue;
                                        }
                                    }
                                    if (DoiThong.GetCountCard(this.GetCard(group[c]).GetNumber()) < 2) {
                                        DoiThong.AddCard(this.GetCard(group[c]));
                                    }
                                }
                            }
                            BonDoiThong.push(DoiThong); // cac bo doi thong
                        }
                    }
                }
            }
            if (LastCards.GetNumOfCards() > 0) // neu la danh chan
            {
                var best = -1;
                for (var ii = BonDoiThong.length - 1; ii >= 0; ii--) {
                    var resultInt = TienLenRule.CheckValidCard(LastCards, BonDoiThong[ii], PlayerCards);
                    if (resultInt == TienLenRule.E_NO_ERROR)
                        return BonDoiThong[ii];
                }
                if (best >= 0) {
                    return BonDoiThong[best];
                }
            } else if (BonDoiThong.length > 0)
                return BonDoiThong[BonDoiThong.length - 1];
        }
        return null;
    },

    Has5DoiThong: function (LastCards, ChooseCards, PlayerCards) {
        if (LastCards.GetNumOfCards() > 0) {
            if ((LastCards.GetNumOfCards() == 1 || LastCards.GetNumOfCards() == 2) && LastCards.GetNumber() != 15) // khac
                return null;
            if (LastCards.GetGroupKind() == TienLenGroupCard.EG_NORMAL && LastCards.GetNumOfCards() != 4) // khong
                return null;
            if (LastCards.GetNumOfCards() >= 6)
                if (LastCards.GetGroupKind() != TienLenGroupCard.EG_BIGGER || LastCards.GetGroupKind() != TienLenGroupCard.EG_SUPER || LastCards.GetGroupKind() != TienLenGroupCard.EG_ULTRA)
                    return null;
        }
        var doi = [];
        var ID = []; // t?i ?a có 6 ?ôi (13/2)
        var i;
        var j = 0;
        var k = 0;
        for (i = 0; i < 20; i++)
            doi[i] = 0;
        for (i = 0; i < this.GetNumOfGroupCards(); i++) {
            for (var s = 0; s < this.GroupCards[i].GetNumOfCards(); s++) {
                var index = this.GroupCards[i].Cards[s].GetNumber();
                if (index != 15) {
                    if (index >= 0 && index < 20) {
                        doi[index]++;
                        if (doi[index] == 2) // doi
                        {
                            k++;
                            ID[j++] = index;
                        }
                    }
                }
            }
        }
        if (k >= 5) {
            for (i = 0; i < 5; i++)
                for (j = i + 1; j < 6; j++)
                    if (ID[i] < ID[j]) // sap xep mang cac doi nho dan
                    {
                        var temp = ID[i];
                        ID[i] = ID[j];
                        ID[j] = temp;
                    }

            var NamDoiThong = [];
            for (i = 0; i < 2; i++) // duyet cac doi tu lon den nho
            {
                if (ID[i] > 0) {
                    if (ID[i] - ID[i + 4] == 4) // co 5 doi thong
                    {
                        var DoiThong = new TienLenGroupCard();
                        var result = false;
                        for (var z = 0; z < ChooseCards.GetNumOfCards(); z++) {
                            result = false;
                            DoiThong.AddCard(ChooseCards.Cards[z]); // them

                            for (var x = i; x < i + 5; x++) {
                                if (ID[x] == ChooseCards.Cards[z].GetNumber()) {
                                    result = true;
                                }
                            }
                            if (!result) {
                                DoiThong.RemoveAllCards();
                                break;
                            }
                        }
                        if (result) {
                            for (var a = i; a < i + 5; a++) {
                                var group = this.GetCardNumber(ID[a]);

                                for (var c = 0; c < group.length; c++) {
                                    if (DoiThong.CheckDoubleCardID(group[c])) // neu
                                        continue;
                                    if (LastCards.GetNumOfCards() > 8) // neu la

                                    {
                                        if (LastCards.GetMaxNumber() == ID[a]) // neu

                                        {
                                            if (LastCards.GetMaxID() > group[c] && LastCards.GetMaxID() > DoiThong.GetMaxID())
                                                continue;
                                        }
                                    }
                                    if (DoiThong.GetCountCard(this.GetCard(group[c]).GetNumber()) < 2)
                                        DoiThong.AddCard(this.GetCard(group[c]));
                                }
                            }
                            NamDoiThong.push(DoiThong); // cac bo doi thong
                        }
                    }
                }
            }
            if (LastCards.GetNumOfCards() > 0) // neu la danh chan
            {
                var best = -1;
                for (var ii = NamDoiThong.length - 1; ii >= 0; ii--) {
                    var resultInt = TienLenRule.CheckValidCard(LastCards, NamDoiThong[ii], PlayerCards);
                    if (resultInt == TienLenRule.E_NO_ERROR)
                        return NamDoiThong[ii];
                }
                if (best >= 0) // neu la bo danh duoc
                {
                    return NamDoiThong[best];
                }
            } else if (NamDoiThong.length > 0)
                return NamDoiThong[NamDoiThong.length - 1]; // 5 doi thong
            // nho nhat
        }
        return null;
    },

    CardInFour: function (number) {
        var ID = this.GetCardNumber(number);
        return ID.length == 4;

    },

    CardIn3Pair: function (number) {
        var ID = this.ArrayPair();

        if (ID == null)
            return false;
        if (ID.length >= 3) {
            for (var i = 0; i < 4; i++) {
                if (ID[i] > 0) {
                    if (ID[i] - ID[i + 2] == 2) {
                        if (ID[i] >= number && number >= ID[i + 2])
                            return true;
                    }
                }
            }
        }
        return false;
    },

    CardIn4Pair: function (number) {
        var ID = this.ArrayPair(); // mang cac doi sap xep giam dan
        if (ID == null)
            return false;
        if (ID.length >= 4) {
            for (var i = 0; i < 3; i++) {
                if (ID[i] > 0) {
                    if (ID[i + 3] - ID[i] == 3) {
                        if (ID[i + 3] >= number && number >= ID[i])
                            return true;
                    }
                }
            }
        }
        return false;
    },

    CardIn5Pair: function (number) {
        var ID = this.ArrayPair();
        if (ID == null)
            return false;
        if (ID.length >= 5) {
            for (var i = 0; i < 2; i++) {
                if (ID[i] > 0) {
                    if (ID[i] - ID[i + 4] == 4) {
                        if (ID[i] >= number && number >= ID[i + 4])
                            return true;
                    }
                }
            }
        }
        return false;
    },

    ArrayPair: function () {
        var doi = [];
        var ID = [];
        for (var i = 0; i < 16; i++)
            doi[i] = 0;
        var l = 0;
        var k = 0;
        for (var i = 0; i < this.GetNumOfGroupCards(); i++) {
            for (var s = 0; s < this.GroupCards[i].GetNumOfCards(); s++) {
                var index = this.GroupCards[i].Cards[s].GetNumber();
                if (index != 15) {
                    if (index >= 0 && index < 16) {
                        doi[index]++;
                        if (doi[index] == 2) // doi
                        {
                            k++;
                            ID[l++] = index;
                        }
                    }
                }
            }
        }
        if (k > 0) {
            for (var i = 0; i < 16 - 1; i++)
                for (var j = i + 1; j < 16; j++)
                    if (ID[i] < ID[j]) // sap xep mang cac doi nho dan
                    {
                        var temp = ID[i];
                        ID[i] = ID[j];
                        ID[j] = temp;
                    }
            return ID;
        }
        return null;
    },

    HasTuQuy: function () {
        var tuquy = [];
        var i, j;
        for (i = 0; i < 20; i++)
            tuquy.push(0);

        for (i = 0; i < this.GroupCards.length; i++) {
            for (j = 0; j < this.GroupCards[i].GetNumOfCards(); j++) {
                var iNum = this.GroupCards[i].Cards[j].GetNumber();
                if (iNum >= 0 && iNum < 20)
                    tuquy[iNum]++;
            }
        }
        for (i = 0; i < 20; i++) {
            if (tuquy[i] == 4) {
                return true;
            }
        }
        return false;
    },

    HasSixPair: function () {
        var doi = [];
        var i, k = 0, j;

        for (i = 0; i < this.GroupCards.length; i++) {
            for (j = 0; j < this.GroupCards[i].GetNumOfCards(); j++) {
                var index = this.GroupCards[i].Cards[j].GetNumber();
                if (index >= 0 && index < 20) {
                    doi[index]++;
                    if (doi[index] % 2 == 0) // doi
                    {
                        k++;
                    }
                }
            }
        }
        return k >= 6;

    },

    GetHas2Fail: function () {
        if (this.GroupCards.length == 0)
            return 0;
        var Sum = 0;
        for (var i = 0; i < this.GroupCards.length; i++) {
            var Cards = this.GroupCards[i].Cards;
            for (var j = 0; j < Cards.length; j++) {
                if (Cards[j].GetNumber() == 15) {
                    switch (Cards[j].GetSuit()) {
                        case 1:
                        case 2:
                            Sum += 0.5;
                            break;
                        case 3:
                        case 4:
                            Sum += 1.0;
                            break;
                    }
                }
            }
        }
        return Sum;
    },

    CheckDoubleCard: function (id) {
        for (var i = 0; i < this.GetNumOfGroupCards(); i++) {
            for (var j = 0; j < this.GroupCards[i].GetNumOfCards(); j++) {
                if (this.GroupCards[i].Cards[i].ID == id) {
                    return true;
                }
            }
        }
        return false;
    },

    GetCardNumber: function (number) {
        var GroupSameNumber = [];
        for (var i = 0; i < this.GetNumOfGroupCards(); i++) {
            for (var j = 0; j < this.GroupCards[i].GetNumOfCards(); j++) {
                if (this.GroupCards[i].Cards[j].GetNumber() == number) {
                    GroupSameNumber.push(this.GroupCards[i].Cards[j].ID);
                }
            }
        }

        var size = GroupSameNumber.length - 1;
        for (var i = 0; i < size; i++) {
            for (var j = i; j < GroupSameNumber.length; j++)
                if (GroupSameNumber[i] > GroupSameNumber[j]) {
                    var tmp = GroupSameNumber[i];
                    GroupSameNumber[i] = GroupSameNumber[j];
                    GroupSameNumber[j] = tmp;
                }
        }
        return GroupSameNumber;
    },

    HasSequence: function (LastCards, ChooseCards, PlayerCards) {
        var kt = false;
        if (LastCards.GetNumOfCards() > 0) {
            if (LastCards.GetGroupKind() != TienLenGroupCard.EG_SEQUENCE)
                return null;
        }

        var TempCards = [];

        for (var i = 0; i < this.GetNumOfGroupCards(); i++) {
            for (var j = i; j < this.GroupCards[i].Cards.length; j++) {
                TempCards.push(this.GroupCards[i].Cards[j]);
            }
        }
        TempCards = TienLenGameLogic.sortCards(TempCards, true);

        if (LastCards.GetNumOfCards() == 0 && ChooseCards.GetNumOfCards() == 2) {
            var ChooseCardsReturn = new TienLenGroupCard();
            ChooseCardsReturn.AddCard(ChooseCards.Cards[0]);
            if (ChooseCards.Cards[1].GetNumber() - ChooseCards.Cards[0].GetNumber() == 1) {
                ChooseCardsReturn.AddCard(ChooseCards.Cards[1]);

                kt = true;
            } else if ((ChooseCards.Cards[1].GetNumber() - ChooseCards.Cards[0].GetNumber()) > 1) {
                for (var i = 0; i < TempCards.length; i++) {
                    if (TempCards[i].GetNumber() != 15) {
                        if (TempCards[i].GetNumber() == ChooseCardsReturn.Cards[ChooseCardsReturn.Cards.length - 1].GetNumber() + 1) {
                            ChooseCardsReturn.AddCard(TempCards[i]);
                        }
                        if (ChooseCardsReturn.Cards[ChooseCardsReturn.Cards.length - 1].GetNumber() == ChooseCards.Cards[1].GetNumber()) {
                            ChooseCardsReturn.Cards.splice(ChooseCardsReturn.Cards.length - 1, 1);
                            ChooseCardsReturn.Cards.push(ChooseCards.Cards[1]);
                            kt = true;
                            break;
                        }
                    }
                }
            }

            if (kt) {
                for (var i = 0; i < TempCards.length; i++) {
                    if (TempCards[i].GetNumber() != 15) {
                        if (TempCards[i].GetNumber() == ChooseCardsReturn.Cards[ChooseCardsReturn.Cards.length - 1].GetNumber() + 1) {
                            ChooseCardsReturn.AddCard(TempCards[i]);
                        }
                    }
                }
                for (var i = TempCards.length - 1; i >= 0; i--) {
                    if (TempCards[i].GetNumber() == ChooseCardsReturn.Cards[0].GetNumber() && TempCards[i].GetNumber() < ChooseCards.Cards[0].GetNumber()) {
                        if (TempCards[i].ID < ChooseCardsReturn.Cards[0].ID) {
                            //ChooseCardsReturn.Cards.erase(ChooseCardsReturn.Cards.begin());
                            //ChooseCardsReturn.Cards.insert(ChooseCardsReturn.Cards.begin(), TempCards[i]);
                            ChooseCardsReturn.Cards.splice(0, 1, TempCards[i]);
                        }
                    } else if (TempCards[i].GetNumber() == ChooseCardsReturn.Cards[0].GetNumber() - 1) {
                        //ChooseCardsReturn.Cards.insert(ChooseCardsReturn.Cards.begin(), TempCards[i]);
                        ChooseCardsReturn.Cards.splice(0, 0, TempCards[i]);

                    }
                }
                for (var i = TempCards.length - 1; i >= 0; i--) {
                    if (TempCards[i].GetNumber() == ChooseCardsReturn.Cards[ChooseCardsReturn.Cards.length - 1].GetNumber() && TempCards[i].GetNumber() > ChooseCards.Cards[1].GetNumber()) {
                        if (TempCards[i].ID > ChooseCardsReturn.Cards[ChooseCardsReturn.Cards.length - 1].ID) {
                            ChooseCardsReturn.Cards.splice(ChooseCardsReturn.Cards.length - 1, 1);
                            ChooseCardsReturn.Cards.push(TempCards[i]);
                        }
                    }
                }

            }
            var resultInt = TienLenRule.CheckValidCard(LastCards, ChooseCardsReturn, PlayerCards);
            if (resultInt == TienLenRule.E_NO_ERROR && ChooseCardsReturn.searchCard(ChooseCards.Cards[1]))
                return ChooseCardsReturn;
            else
                return null;
        } else
            return null;
    },

    AutoSequence: function (LastCards, ChooseCards, PlayerCards) {
        var group = this.HasSequence(LastCards, ChooseCards, PlayerCards);
        var gc = new TienLenGroupCard();
        if (group != null) {
            group.Sort(true);
            for (var i = 0; i < group.GetNumOfCards(); i++) {
                var num = group.Cards[i].GetNumber();
                var length = this.GetCardNumber(num).length;
                var result = (this.CardInFour(num) || ((this.CardIn3Pair(num) || this.CardIn4Pair(num) || this.CardIn5Pair(num)) && length == 2)) && (!ChooseCards.CheckDoubleCardNumber(num));
                if (result == false)
                    gc.AddCard(group.Cards[i]);
                else if (gc.GetGroupKind() == TienLenGroupCard.EG_SEQUENCE) {
                    var b = false;
                    for (var j = 0; j < ChooseCards.GetNumOfCards(); j++)
                        if (gc.GetMinNumber() > ChooseCards.Cards[j].GetNumber() || gc.GetMaxNumber() < ChooseCards.Cards[j].GetNumber())
                            b = true;
                    if (b == false)
                        return gc;
                    else
                        gc.RemoveAllCards();
                }
            }
            if (gc.GetGroupKind() == TienLenGroupCard.EG_SEQUENCE)
                return gc;
            var bSanh = true;
            for (var i = 0; i < ChooseCards.GetNumOfCards(); i++) {
                var n = ChooseCards.Cards[i].GetNumber();
                if ((this.CardIn3Pair(n) || this.CardIn4Pair(n) || this.CardIn5Pair(n)) == false)
                    bSanh = false;
            }
            if (bSanh)
                return group;
        }
        return group;
    },

    Auto4Pair: function (LastCards, ChooseCards, PlayerCards) {

        var group = this.Has4DoiThong(LastCards, ChooseCards, PlayerCards);
        if (group != null) {
            group.Sort(true);
            var gc = new TienLenGroupCard();
            for (var i = 0; i < group.GetNumOfCards(); i++) {
                var num = group.Cards[i].GetNumber();
                var result = ChooseCards.CheckDoubleCardNumber(num);
                if (result == true) {
                    gc.AddCard(group.Cards[i]);
                } else if (this.CardInFour(num)) {
                    if (num > group.GetMinNumber() && num < group.GetMaxNumber()) // truong

                    {
                        if (num - group.GetMinNumber() == 2 || num - group.GetMinNumber() == 1) // truong

                            gc.AddCard(group.Cards[i]);
                        else
                            return group;
                    }
                    if (num == group.GetMinNumber() || num == group.GetMaxNumber()) {
                        if (gc.GetGroupKind() == TienLenGroupCard.EG_BIGGER || gc.GetGroupKind() == TienLenGroupCard.EG_SUPER || gc.GetGroupKind() == TienLenGroupCard.EG_ULTRA) {
                            if (gc.GetMinNumber() <= ChooseCards.GetMinNumber() && gc.GetMaxNumber() >= ChooseCards.GetMaxNumber())
                                return gc;
                            else {
                                gc.RemoveAllCards();
                            }
                        } else if (gc.GetNumOfCards() >= 4) {
                            gc.AddCard(group.Cards[i]);
                        }
                    }
                } else {
                    gc.AddCard(group.Cards[i]);
                }
            }
            if (gc.GetGroupKind() == TienLenGroupCard.EG_SUPER || gc.GetGroupKind() == TienLenGroupCard.EG_BIGGER || gc.GetGroupKind() == TienLenGroupCard.EG_ULTRA)
                if (gc.GetMinNumber() <= ChooseCards.GetMinNumber() && gc.GetMaxNumber() >= ChooseCards.GetMaxNumber())
                    return gc;
        }
        return group;
    },

    Auto5Pair: function (LastCards, ChooseCards, PlayerCards) {
        var group = this.Has5DoiThong(LastCards, ChooseCards, PlayerCards);
        if (group != null) {
            group.Sort(true); // 5 doi thong da duoc sap xep tang dan
            var gc = new TienLenGroupCard();
            var i;
            for (i = 0; i < group.GetNumOfCards(); i++) {
                var num = group.Cards[i].GetNumber();
                var result = ChooseCards.CheckDoubleCardNumber(num);
                if (result == true) {
                    gc.AddCard(group.Cards[i]);
                } else if (this.CardInFour(num)) {
                    if (num > group.GetMinNumber() && num < group.GetMaxNumber()) {
                        if (gc.GetGroupKind() == TienLenGroupCard.EG_BIGGER || gc.GetGroupKind() == TienLenGroupCard.EG_SUPER || gc.GetGroupKind() == TienLenGroupCard.EG_ULTRA) {
                            if (gc.GetMinNumber() <= ChooseCards.GetMinNumber() && gc.GetMaxNumber() >= ChooseCards.GetMaxNumber()) {
                                return gc;
                            } else {
                                gc.RemoveAllCards();
                            }
                        } else {
                            if (num - group.GetMinNumber() == 2) {
                                if (num > ChooseCards.GetMaxNumber()) {
                                    gc.AddCard(group.Cards[i]);
                                    if (gc.GetGroupKind() == TienLenGroupCard.EG_BIGGER || gc.GetGroupKind() == TienLenGroupCard.EG_SUPER || gc.GetGroupKind() == TienLenGroupCard.EG_ULTRA)
                                        if (gc.GetMinNumber() <= ChooseCards.GetMinNumber() && gc.GetMaxNumber() >= ChooseCards.GetMaxNumber())
                                            return gc;
                                } else {
                                    if (gc.GetNumOfCards() > 2)
                                        gc.RemoveAllCards();
                                    gc.AddCard(group.Cards[i]);
                                }
                            } else {
                                gc.RemoveAllCards();
                            }
                        }
                    } else if (num == group.GetMinNumber() || num == group.GetMaxNumber()) {
                        if (gc.GetGroupKind() == TienLenGroupCard.EG_BIGGER || gc.GetGroupKind() == TienLenGroupCard.EG_SUPER || gc.GetGroupKind() == TienLenGroupCard.EG_ULTRA) {
                            if (gc.GetMinNumber() <= ChooseCards.GetMinNumber() && gc.GetMaxNumber() >= ChooseCards.GetMaxNumber())
                                return gc;
                            else
                                gc.RemoveAllCards();
                        }
                    }
                } else {
                    gc.AddCard(group.Cards[i]);
                }
            }
            if (gc.GetGroupKind() == TienLenGroupCard.EG_SUPER || gc.GetGroupKind() == TienLenGroupCard.EG_BIGGER || gc.GetGroupKind() == TienLenGroupCard.EG_ULTRA)
                if (gc.GetMinNumber() <= ChooseCards.GetMinNumber() && gc.GetMaxNumber() >= ChooseCards.GetMaxNumber())
                    return gc;
        }
        return group;
    },

    CheckGroup: function (LastCards, ChooseCards, PlayerCards) {
        if (LastCards.GetNumOfCards() == 0) {
            if (ChooseCards.GetNumOfCards() < 2)
                return null;
        } else if (ChooseCards.GetNumOfCards() < 1)
            return null;
        var i;
        var group = new TienLenGroupCard();
        var card;
        for (i = 0; i < ChooseCards.GetNumOfCards(); i++) {
            card = new TienLenCard();
            card.ID = ChooseCards.Cards[i].ID;
            group.AddCard(card);
        }
        var groupCard = null;
        if (LastCards.GetNumOfCards() == 0) {
            if (group.GetNumOfCards() == 3) {
                if (group.GetGroupKind() == TienLenGroupCard.EG_NORMAL) {
                    groupCard = this.HasFour(LastCards, group, PlayerCards);
                } else {
                    var result = true;
                    if (group.Cards[0].GetNumber() != group.Cards[1].GetNumber() && group.Cards[2].GetNumber() != group.Cards[2].GetNumber() && group.Cards[0].GetNumber() != group.Cards[2].GetNumber())
                        result = false;
                    if (result) {
                        groupCard = this.Auto5Pair(LastCards, group, PlayerCards);
                        if (groupCard == null) {
                            groupCard = this.Auto4Pair(LastCards, group, PlayerCards);
                        }
                        if (groupCard == null) {
                            groupCard = this.Has3DoiThong(LastCards, group, PlayerCards);
                        }
                    }
                }
            } else if (group.GetNumOfCards() == 2) {
                if (groupCard == null) {
                    if (ChooseCards.GetGroupKind() != TienLenGroupCard.EG_NORMAL)
                        groupCard = this.AutoSequence(LastCards, group, PlayerCards);
                }
            }
        }
        if (groupCard != null) {
            return groupCard;
        }
        return null;
    },

    FirstTurnPlay: function (LastCards, ChooseCards, PlayerCards) {
        return this.CheckGroup(LastCards, ChooseCards, PlayerCards);
    },

    OnTurnPlay: function (LastCards, ChooseCards, PlayerCards) {
        var ChooseCardsTemp = new TienLenGroupCard();
        var chooseCardOrigin = [];
        ChooseCardsTemp.Cards.push(ChooseCards.Cards[0]);
        var cardChoose = ChooseCards.Cards[0];
        var TempCards = [];
        for (var i = 0; i < PlayerCards.GetNumOfGroupCards(); i++) {
            for (var j = 0; j < PlayerCards.GroupCards[i].Cards.length; j++) {
                TempCards.push(PlayerCards.GroupCards[i].Cards[j]);
            }
        }

        for (var i = 0; i < ChooseCards.GetNumOfCards(); i++) {
            chooseCardOrigin.push(ChooseCards.Cards[i]);
        }
        TempCards = TienLenGameLogic.sortCards(TempCards, true);

        var vectorTuQuy = [];
        var groupTuQuy = null;
        var size = TempCards.length - 1;
        for (var i = 0; i < size; i++) {
            var countTQ = 0;
            groupTuQuy = new TienLenGroupCard();
            groupTuQuy.AddCard(TempCards[i]);
            for (var j = i + 1; j < TempCards.length; j++) {
                if (TempCards[i].GetNumber() == TempCards[j].GetNumber()) {
                    countTQ++;
                    groupTuQuy.AddCard(TempCards[j]);
                }
            }
            if (countTQ == 4) {
                vectorTuQuy.push(groupTuQuy);
            }
        }

        var vectoDoiThong = [];
        var groupDoiThong = null;
        for (var i = 0; i < TempCards.length; i++) {

            var num = TempCards.length - 2;

            if (i <= num) {
                if (TempCards[i].GetNumber() == TempCards[i + 1].GetNumber()) {
                    groupDoiThong = new TienLenGroupCard();
                    groupDoiThong.AddCard(TempCards[i]);
                    var k = 1;
                    for (var j = i + 1; j < TempCards.length; j++) {
                        if (k == 1) // 1 card
                        {
                            if (TempCards[j].GetNumber() == groupDoiThong.Cards[groupDoiThong.Cards.length - 1].GetNumber()) {
                                groupDoiThong.AddCard(TempCards[j]);
                                k++;
                                continue;
                            } else {
                                groupDoiThong.Cards.splice(groupDoiThong.Cards.length-1,1);
                                break;
                            }
                        }

                        if (k == 2) // 2 card
                        {
                            if (TempCards[j].GetNumber() != 15) {
                                if (TempCards[j].GetNumber() == groupDoiThong.Cards[groupDoiThong.Cards.length - 1].GetNumber() + 1) {
                                    groupDoiThong.AddCard(TempCards[j]);
                                    k--;
                                }
                            }
                        }
                    }
                    if (groupDoiThong.GetNumOfCards() >= 6) {
                        if (groupDoiThong.GetNumOfCards() % 2 == 1)
                            groupDoiThong.Cards.splice(groupDoiThong.Cards.length-1,1);

                        vectoDoiThong.push(groupDoiThong);
                    }
                }
            }
        }

        switch (LastCards.GetGroupKind()) {
            case TienLenGroupCard.EG_ONECARD:
            {
                if (LastCards.GetNumber() == 15) {
                    var isDoiThong = false;
                    for (var i = 0; i < vectoDoiThong.length; i++) {
                        if (vectoDoiThong[i].searchCard(ChooseCardsTemp.Cards[0])) {
                            ChooseCards = vectoDoiThong[i];
                            isDoiThong = true;
                            break;
                        }
                    }
                    if (isDoiThong)
                        break;
                    else {
                        var kt = 0;
                        for (var i = 0; i < TempCards.length; i++) {
                            if (TempCards[i].GetNumber() == ChooseCardsTemp.Cards[0].GetNumber()) {
                                ChooseCardsTemp.AddCard(TempCards[i]);
                                kt++;
                            }
                        }

                        if (kt == 4) {
                            ChooseCards.Cards = ChooseCardsTemp.Cards;
                            break;
                        }
                    }
                }
                break;
            }
            case TienLenGroupCard.EG_NORMAL:
            {
                if (LastCards.GetNumOfCards() == 2) // danh doi
                {
                    if (LastCards.GetNumber() != 15) // khong phai doi 2
                    {
                        var maxID = LastCards.Cards[1].ID;
                        if (ChooseCardsTemp.Cards[0].GetNumber() >= LastCards.Cards[0].GetNumber()) {
                            if (ChooseCardsTemp.Cards[0].ID > maxID) {
                                for (var i = 0; i < TempCards.length; i++) {
                                    if ((TempCards[i].ID != ChooseCardsTemp.Cards[0].ID) && (TempCards[i].GetNumber() == ChooseCardsTemp.Cards[0].GetNumber())) {
                                        ChooseCardsTemp.AddCard(TempCards[i]);
                                        break;
                                    }
                                }
                            } else {
                                for (var i = 0; i < TempCards.length; i++) {
                                    if (TempCards[i].ID > ChooseCardsTemp.Cards[0].ID && TempCards[i].GetNumber() == ChooseCardsTemp.Cards[0].GetNumber()) {
                                        ChooseCardsTemp.AddCard(TempCards[i]);
                                        break;
                                    }
                                }
                            }

                        }
                        if (ChooseCardsTemp.Cards.length == 2) {
                            ChooseCards.Cards = ChooseCardsTemp.Cards;
                        }
                    } else {
                        if (ChooseCardsTemp.Cards[0].GetNumber() == 15) {
                            for (var i = 0; i < TempCards.length; i++) {
                                if (TempCards[i].GetNumber() == 15 && TempCards[i].ID != ChooseCardsTemp.Cards[0].ID) {
                                    ChooseCardsTemp.AddCard(TempCards[i]);
                                    break;
                                }
                            }
                            if (ChooseCardsTemp.Cards.length == 2 && ChooseCardsTemp.GetMaxID() > LastCards.GetMaxID()) {
                                ChooseCards = ChooseCardsTemp;
                                break;
                            }

                        }

                        var isDoithong1 = false;
                        for (var i = 0; i < vectoDoiThong.length; i++) {
                            if (vectoDoiThong[i].Cards.length >= 8) {
                                ChooseCards = vectoDoiThong[i];
                                isDoithong1 = true;
                                break;
                            }
                        }
                        if (isDoithong1) {
                            break;
                        } else {
                            var kt1 = 0;
                            for (var i = 0; i < TempCards.length; i++) {
                                if (TempCards[i].GetNumber() == ChooseCardsTemp.Cards[0].GetNumber()) {
                                    ChooseCardsTemp.AddCard(TempCards[i]);
                                    kt1++;
                                }
                            }

                            if (kt1 == 4) {
                                ChooseCards.Cards = ChooseCardsTemp.Cards;
                                break;
                            }
                        }
                    }

                } else if (LastCards.GetNumOfCards() == 3) // xam' co
                {
                    if (ChooseCardsTemp.Cards[0].GetNumber() > LastCards.Cards[0].GetNumber()) {
                        for (var i = 0; i < TempCards.length; i++) {
                            if (ChooseCardsTemp.Cards.length < 3) {
                                if (TempCards[i].ID != ChooseCardsTemp.Cards[0].ID && TempCards[i].GetNumber() == ChooseCardsTemp.Cards[0].GetNumber()) {
                                    ChooseCardsTemp.AddCard(TempCards[i]);
                                }
                            } else
                                break;

                        }
                        if (ChooseCardsTemp.Cards.length == 3) {
                            ChooseCards.Cards = ChooseCardsTemp.Cards;
                        }
                    }
                } else // tu qui
                {
                    if (ChooseCardsTemp.Cards[0].ID > LastCards.Cards[0].ID) // kiem
                    {
                        for (var i = 0; i < TempCards.length; i++) {
                            if (ChooseCardsTemp.Cards.length < 4) {
                                if (TempCards[i].ID != ChooseCardsTemp.Cards[0].ID && TempCards[i].GetNumber() == ChooseCardsTemp.Cards[0].GetNumber()) {
                                    ChooseCardsTemp.AddCard(TempCards[i]);
                                }
                            } else {
                                break;
                            }
                        }
                        if (ChooseCardsTemp.Cards.length == 4) {
                            ChooseCards.Cards = ChooseCardsTemp.Cards;
                            break;
                        }
                    }

                    for (var i = 0; i < vectoDoiThong.length; i++) {
                        if (vectoDoiThong[i].Cards.length >= 8) {
                            ChooseCards = vectoDoiThong[i];
                            break;
                        }
                    }
                }
                break;
            }
            case TienLenGroupCard.EG_SEQUENCE:
            {

                if (ChooseCardsTemp.Cards[0].ID < LastCards.Cards[LastCards.Cards.length - 1].ID) // card

                {
                    for (var i = 0; i < TempCards.length; i++) {
                        if (ChooseCardsTemp.Cards.length < LastCards.Cards.length) // neu

                        {
                            if (TempCards[i].GetNumber() != 15) {
                                if (TempCards[i].GetNumber() == ChooseCardsTemp.Cards[ChooseCardsTemp.Cards.length - 1].GetNumber() + 1) {
                                    ChooseCardsTemp.AddCard(TempCards[i]);
                                }
                                if (ChooseCardsTemp.Cards[ChooseCardsTemp.Cards.length - 1].ID >= LastCards.Cards[LastCards.Cards.length - 1].ID)
                                    break;
                            }
                        } else {
                            break;
                        }
                    }

                    if (ChooseCardsTemp.Cards.length == LastCards.Cards.length && ChooseCardsTemp.Cards[ChooseCardsTemp.Cards.length - 1].GetNumber() == LastCards.Cards[LastCards.Cards.length - 1].GetNumber() && ChooseCardsTemp.Cards[ChooseCardsTemp.Cards.length - 1].ID < LastCards.Cards[LastCards.Cards.length - 1].ID) {
                        for (var i = 0; i < TempCards.length; i++) {
                            if (ChooseCardsTemp.Cards[ChooseCardsTemp.Cards.length - 1].ID < LastCards.Cards[LastCards.Cards.length - 1].ID)
                                if (TempCards[i].GetNumber() == ChooseCardsTemp.Cards[ChooseCardsTemp.Cards.length - 1].GetNumber())
                                    if (TempCards[i].ID > ChooseCardsTemp.Cards[ChooseCardsTemp.Cards.length - 1].ID) {
                                        ChooseCardsTemp.Cards.splice(ChooseCardsTemp.Cards.length - 1, 1, TempCards[i]);
                                    }
                        }

                    }

                    if (ChooseCardsTemp.Cards[ChooseCardsTemp.Cards.length - 1].ID < LastCards.Cards[LastCards.Cards.length - 1].ID) {
                        return null;
                    }
                }

                if (ChooseCardsTemp.Cards.length < LastCards.Cards.length) // add

                {
                    for (var i = TempCards.length - 1; i >= 0; i--) {
                        if (TempCards[i].GetNumber() < cardChoose.GetNumber()) {
                            if (TempCards[i].GetNumber() == ChooseCardsTemp.Cards[0].GetNumber()) // neu
                            {
                                if (TempCards[i].ID < ChooseCardsTemp.Cards[0].ID) {
                                    //ChooseCardsTemp.Cards.erase(ChooseCardsTemp.Cards.begin());
                                    //ChooseCardsTemp.Cards.insert(ChooseCardsTemp.Cards.begin(), TempCards[i]);
                                    ChooseCardsTemp.Cards.splice(0, 1, TempCards[i]);
                                }
                            }
                        }

                        if (ChooseCardsTemp.Cards.length < LastCards.Cards.length) {
                            if (TempCards[i].GetNumber() == ChooseCardsTemp.Cards[0].GetNumber() - 1) {
                                //ChooseCardsTemp.Cards.insert(ChooseCardsTemp.Cards.begin(), TempCards[i]); // add
                                ChooseCardsTemp.Cards.splice(0, 0, TempCards[i]);
                            }
                        }
                    }
                }

                if (ChooseCardsTemp.Cards.length < LastCards.Cards.length) {
                    for (var i = 0; i < TempCards.length; i++) {
                        if (ChooseCardsTemp.Cards.length < LastCards.Cards.length) {
                            if (TempCards[i].GetNumber() != 15) {
                                if (TempCards[i].GetNumber() == ChooseCardsTemp.Cards[ChooseCardsTemp.Cards.length - 1].GetNumber() + 1) {
                                    ChooseCardsTemp.AddCard(TempCards[i]);
                                }
                            }
                        } else {
                            break;
                        }
                    }
                }
                if (ChooseCardsTemp.Cards.length == LastCards.Cards.length) {
                    var resultInt = TienLenRule.CheckValidCard(LastCards, ChooseCardsTemp, PlayerCards);
                    if (resultInt == TienLenRule.E_NO_ERROR)
                        ChooseCards.Cards = ChooseCardsTemp.Cards;
                } else {
                }
                break;
            }
            case TienLenGroupCard.EG_BIGGER:
            {
                var kt1 = 0;
                for (var i = 0; i < TempCards.length; i++) {
                    if (TempCards[i].GetNumber() == ChooseCardsTemp.Cards[0].GetNumber()) {
                        ChooseCardsTemp.AddCard(TempCards[i]);
                        kt1++;
                    }
                }
                if (kt1 == 4) {
                    ChooseCards.Cards = ChooseCardsTemp.Cards;
                    break;
                }

                for (var i = 0; i < vectoDoiThong.length; i++) {
                    if (vectoDoiThong[i].searchCard(ChooseCardsTemp.Cards[0])) {
                        if (vectoDoiThong[i].Cards.length == 6) {
                            if (vectoDoiThong[i].Cards[vectoDoiThong[i].Cards.length - 1].ID > LastCards.Cards[LastCards.Cards.length - 1].ID) {
                                ChooseCards = vectoDoiThong[i];
                                break;
                            }
                        }
                        if (vectoDoiThong[i].Cards.length > 6) {
                            ChooseCards = vectoDoiThong[i];
                            break;
                        }
                    }

                }
                break;
            }
            case TienLenGroupCard.EG_SUPER:
            {
                for (var i = 0; i < vectoDoiThong.length; i++) {
                    if (vectoDoiThong[i].searchCard(ChooseCardsTemp.Cards[0])) {
                        if (vectoDoiThong[i].Cards.length == 8) {
                            if (vectoDoiThong[i].Cards[vectoDoiThong[i].Cards.length - 1].ID > LastCards.Cards[LastCards.Cards.length - 1].ID) {
                                ChooseCards = vectoDoiThong[i];
                                break;
                            }
                        } else if (vectoDoiThong[i].Cards.length == 10) {
                            ChooseCards = vectoDoiThong[i];
                            break;
                        }
                    }
                }
                break;
            }
            case TienLenGroupCard.EG_ULTRA:
            {
                for (var i = 0; i < vectoDoiThong.length; i++) {
                    if (vectoDoiThong[i].searchCard(ChooseCardsTemp.Cards[0])) {
                        if (vectoDoiThong[i].Cards.length == 10) {
                            if (vectoDoiThong[i].Cards[vectoDoiThong[i].Cards.length - 1].ID > LastCards.Cards[LastCards.Cards.length - 1].ID) {
                                ChooseCards = vectoDoiThong[i];
                                break;
                            }
                        }
                    }
                }
                break;
            }
        }
        var i, j;
        if (ChooseCards.Cards.length > 1) {

            for (i = 0; i < chooseCardOrigin.length; i++) {
                if (this.checkIn(chooseCardOrigin[i].ID, ChooseCards))
                    continue;
                for (j = 0; j < ChooseCards.Cards.length; j++)
                    if (ChooseCards.Cards[j].GetNumber() == chooseCardOrigin[i].GetNumber() && !this.checkIn(ChooseCards.Cards[j].ID, chooseCardOrigin)) {
                        // trao doi ID
                        ChooseCards.Cards[j].ID = chooseCardOrigin[i].ID;
                        break;
                    }
            }
            return ChooseCards;
        }
        return null;
    },

    checkIn: function (number, group) {
        var i;

        if (group instanceof TienLenGroupCard) {
            for (i = 0; i < group.Cards.length; i++) {
                if (number == group.Cards[i].ID)
                    return true;
            }
        }
        else {
            for (i = 0; i < group.length; i++) {
                if (number == group[i].ID)
                    return true;
            }
        }

        return false;
    },

    CanPlay: function (group) {
        switch (group.GetGroupKind()) {
            case TienLenGroupCard.EG_NONE:
                return true;
            case TienLenGroupCard.EG_ONECARD:
            {
                return this.CanPlayOneCard(group);
            }
            case TienLenGroupCard.EG_NORMAL:
            {
                return this.CanPlayNormal(group);
            }
            case TienLenGroupCard.EG_SEQUENCE:
            {
                return this.CanPlaySequence(group);
            }
            case TienLenGroupCard.EG_ULTRA:
            {
                return this.CanPlayULTRA(group);
            }
            case TienLenGroupCard.EG_SUPER:
            {
                return this.CanPlaySUPER(group);
            }
            case TienLenGroupCard.EG_BIGGER:
            {
                return this.CanPlayBIGGER(group);
            }
        }
        return false;
    },

    CanPlayOneCard: function (group) {
        if (group.GetNumber() == 15) {
            if (this.CanPlayULTRA(null) || this.CanPlaySUPER(null) || this.CanPlayBIGGER(null) || this.GetMaxFour() > -1)
                return true;
        }
        var maxID = -1;
        var maxNum = -1;
        for (var i = 0; i < this.GetNumOfGroupCards(); i++) {
            for (var s = 0; s < this.GroupCards[i].GetNumOfCards(); s++) {
                if (maxNum < this.GroupCards[i].Cards[s].GetNumber()) {
                    maxNum = this.GroupCards[i].Cards[s].GetNumber();
                    var groupID = this.GetCardNumber(maxNum);

                    if (groupID.length > 0) {
                        for (var m = 0; m < groupID.length; m++) {
                            if (maxID < groupID[m])
                                maxID = groupID[m];
                        }
                    }
                }
            }
        }
        if (maxNum > group.GetMaxNumber())
            return true;
        else if (maxNum == group.GetMaxNumber()) {
            if (maxID > group.GetMaxID())
                return true;
        }
        return false;
    },

    CanPlayBIGGER: function (group) {
        if (this.CanPlayULTRA(null) || this.CanPlaySUPER(null))
            return true;
        var tuquy = [];
        var i;
        var j = 0;
        var k = 0;
        for (i = 0; i < 16; i++) {
            tuquy.push(0);
        }
        for (i = 0; i < this.GetNumOfGroupCards(); i++) {
            for (var ss = 0; ss < this.GroupCards[i].GetNumOfCards(); ss++) {
                var ind = this.GroupCards[i].Cards[ss].GetNumber();
                if (ind >= 0 && ind < 16) {
                    tuquy[ind]++;
                    if (tuquy[ind] == 4) // 3
                    {
                        return true;
                    }
                }
            }
        }

        var doi = [];
        var ID = [];
        j = 0;
        k = 0;
        for (i = 0; i < 16; i++)
            doi[i] = 0;
        for (i = 0; i < this.GetNumOfGroupCards(); i++) {
            for (var s = 0; s < this.GroupCards[i].GetNumOfCards(); s++) {
                var index = this.GroupCards[i].Cards[s].GetNumber();
                if (index != 15) {
                    if (index >= 0 && index < 16) {
                        doi[index]++;
                        if (doi[index] == 2) // doi
                        {
                            k++;
                            ID[j++] = index;
                        }
                    }
                }
            }
        }
        if (k >= 3) {
            for (i = 0; i < 5; i++)
                for (j = i + 1; j < 6; j++)
                    if (ID[i] < ID[j]) // sap xep mang cac doi nho dan
                    {
                        var temp = ID[i];
                        ID[i] = ID[j];
                        ID[j] = temp;
                    }

            for (i = 0; i < 4; i++) // duyet cac doi tu lon den nho
            {
                if (ID[i] > 0) {
                    if (ID[i] - ID[i + 2] == 2) // co 3 doi thong
                    {
                        if (group == null) // kiem tra co 3 doi thong hay khong,
                        // thi ko can truyen group vao
                            return true; // co 3 doi thong
                        else {
                            if (ID[i] > group.GetMaxNumber())
                                return true;
                            else if (ID[i] == group.GetMaxNumber()) {
                                var groupID = this.GetCardNumber(ID[i]); // group

                                if (groupID.length > 0) {
                                    for (var m = 0; m < groupID.length; m++) {
                                        if (group.GetMaxID() < groupID[m])
                                            return true;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return false;
    },

    CanPlaySUPER: function (group) {
        if (this.CanPlayULTRA(null))
            return true;
        var doi = [];
        var ID = []; // toi da có 6 dôi (13/2)
        var i;
        var j = 0;
        var k = 0;
        for (i = 0; i < 16; i++)
            doi[i] = 0;

        for (i = 0; i < this.GetNumOfGroupCards(); i++) {
            for (var s = 0; s < this.GroupCards[i].GetNumOfCards(); s++) {
                var index = this.GroupCards[i].Cards[s].GetNumber();
                if (index != 15) // khac quan 2
                {
                    if (index >= 0 && index < 16) {
                        doi[index]++;
                        if (doi[index] == 2) // doi
                        {
                            k++;
                            ID[j++] = index;
                        }
                    }
                }
            }
        }
        if (k >= 4) {
            for (i = 0; i < 5; i++)
                for (j = i + 1; j < 6; j++)
                    if (ID[i] < ID[j]) // sap xep mang cac doi nho dan
                    {
                        var temp = ID[i];
                        ID[i] = ID[j];
                        ID[j] = temp;
                    }

            for (i = 0; i < 3; i++) // duyet cac doi tu lon den nho
            {
                if (ID[i] > 0) {
                    if (ID[i] - ID[i + 3] == 3) // co 4 doi thong
                    {
                        if (group == null)
                            return true;
                        else {
                            if (ID[i] > group.GetMaxNumber())
                                return true;
                            else if (ID[i] == group.GetMaxNumber()) {
                                var groupID = this.GetCardNumber(ID[i]); // group

                                if (groupID.length > 0) {
                                    for (var m = 0; m < groupID.length; m++) {
                                        if (group.GetMaxID() < groupID[m])
                                            return true;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return false;
    },

    CanPlayULTRA: function (group) {
        var doi = [];
        var ID = []; // toi da có 6 dôi (13/2)
        var i;
        var j = 0;
        var k = 0;
        for (i = 0; i < 16; i++)
            doi[i] = 0;
        for (i = 0; i < this.GetNumOfGroupCards(); i++) {
            for (var s = 0; s < this.GroupCards[i].GetNumOfCards(); s++) {
                var index = this.GroupCards[i].Cards[s].GetNumber();
                if (index != 15) // khac quan 2
                {
                    if (index >= 0 && index < 16) {
                        doi[index]++;
                        if (doi[index] == 2) // doi
                        {
                            k++;
                            ID[j++] = index;
                        }
                    }
                }
            }
        }
        if (k >= 5) {
            for (i = 0; i < 5; i++)
                for (j = i + 1; j < 6; j++)
                    if (ID[i] < ID[j]) // sap xep mang cac doi nho dan
                    {
                        var temp = ID[i];
                        ID[i] = ID[j];
                        ID[j] = temp;
                    }

            for (i = 0; i < 2; i++) // duyet cac doi tu lon den nho
            {
                if (ID[i] > 0) {
                    if (ID[i] - ID[i + 4] == 4) // co 5 doi thong
                    {
                        if (group == null)
                            return true;
                        else {
                            if (ID[i] > group.GetMaxNumber())
                                return true;
                            else if (ID[i] == group.GetMaxNumber()) {
                                var groupID = this.GetCardNumber(ID[i]); // group

                                if (groupID.length > 0) {
                                    for (var m = 0; m < groupID.length; m++) {
                                        if (group.GetMaxID() < groupID[m])
                                            return true;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return false;
    },

    CanPlaySequence: function (group) {
        if (group.GetGroupKind() != TienLenGroupCard.EG_SEQUENCE)
            return false;
        var number = [];
        var i = 0;
        var j = 0;
        var k = 0;
        for (i = 0; i < 13; i++) // 13 quan bai
        {
            number[i] = 0;
        }
        for (i = 0; i < this.GetNumOfGroupCards(); i++) {
            for (var s = 0; s < this.GroupCards[i].GetNumOfCards(); s++) {
                number[k++] = this.GroupCards[i].Cards[s].GetNumber();
            }
        }

        for (i = 0; i < 12; i++) {
            for (j = i + 1; j < 13; j++)
                if (number[i] < number[j]) {
                    var tmp = number[i];
                    number[i] = number[j];
                    number[j] = tmp;
                }
        }

        var n;
        for (i = 0; i < 12; i++) {
            var S = [];
            n = number[i];
            if (n == 0 || n == 15 || n < group.GetMinNumber())
                continue;
            S.push(n);
            for (j = i + 1; j < 13; j++) {
                if (number[j] != 15) {
                    if (number[j] == n - 1) {
                        S.push(number[j]);
                        n = number[j];
                        if (S.length == group.GetNumOfCards())
                            break;
                    }
                }
            }
            if (S.length >= group.GetNumOfCards()) {
                var maxNum = -1;
                for (var x = 0; x < S.length; x++) {
                    if (maxNum < S[x]) {
                        maxNum = S[x];
                    }
                }
                if (maxNum > group.GetMaxNumber())
                    return true;
                else if (maxNum == group.GetMaxNumber()) {
                    var IDCard = this.GetCardNumber(maxNum);
                    if (IDCard.length > 0) {
                        for (var m = 0; m < IDCard.length; m++) {
                            if (group.GetMaxID() < IDCard[m])
                                return true;
                        }
                    }
                }
            }
        }
        return false;
    },

    CanPlayNormal: function (group) {
        if (group.GetNumOfCards() == 4) {
            if (this.CanPlayULTRA(null) || this.CanPlaySUPER(null))
                return true;
            if (this.GetMaxFour() > group.GetMaxNumber())
                return true;
        } else if (group.GetNumOfCards() == 3) {
            if (this.GetMaxThree() > group.GetMaxNumber())
                return true;
        } else if (group.GetNumOfCards() == 2) {
            if (group.GetNumber() == 15) // doi 2
            {
                if (this.CanPlayULTRA(null) || this.CanPlaySUPER(null) || this.GetMaxFour() > -1) // tu quy
                    return true;
                if (this.GetMaxPair() > group.GetMaxID())
                    return true;
            } else if (this.GetMaxPair() > group.GetMaxID())
                return true;
        }
        return false;
    },

    GetMaxPair: function () {
        var Pair = [];
        var number = []; // toi da 6 doi
        var i;
        var j = 0;
        var k = 0;
        for (i = 0; i < 16; i++) {
            Pair[i] = 0;
        }
        for (i = 0; i < this.GetNumOfGroupCards(); i++) {
            for (var s = 0; s < this.GroupCards[i].GetNumOfCards(); s++) {
                var index = this.GroupCards[i].Cards[s].GetNumber();
                if (index >= 0 && index < 16) {
                    Pair[index]++;
                    if (Pair[index] == 2) // doi
                    {
                        k++; // so doi
                        number[j++] = index;
                    }
                }
            }
        }
        if (k >= 1) {
            var max = -1;
            for (i = 0; i < k; i++) {
                if (max < number[i])
                    max = number[i];
            }
            var groupID = this.GetCardNumber(max);
            if (groupID.length > 0)
                return groupID[groupID.length - 1];
        }
        return -1;
    },

    GetMaxThree: function () {
        var boba = [];
        var number = []; // toi da 4 bo ba
        var i;
        var j = 0;
        var k = 0;
        for (i = 0; i < 16; i++) {
            boba.push(0);
        }
        for (i = 0; i < this.GetNumOfGroupCards(); i++) {
            for (var s = 0; s < this.GroupCards[i].GetNumOfCards(); s++) {
                var index = this.GroupCards[i].Cards[s].GetNumber();

                if (index >= 0 && index < 16) {
                    boba[index]++;
                    if (boba[index] == 3) // 3
                    {
                        k++;
                        number[j++] = index;
                    }
                }
            }
        }

        if (k >= 1) {
            for (i = 0; i < k - 1; i++)
                for (j = i + 1; j < k; j++)
                    if (number[i] < number[j]) {
                        var tmp = number[i];
                        number[i] = number[j];
                        number[j] = tmp;
                    }
            return number[0];
        }
        return -1;
    },

    GetMaxFour: function () {
        var tuquy = [];
        var number = []; // toi da 3 bo tu quy
        var i;
        var j = 0;
        var k = 0;
        for (i = 0; i < 20; i++) {
            tuquy.push(0);
        }
        for (i = 0; i < this.GetNumOfGroupCards(); i++) {
            for (var s = 0; s < this.GroupCards[i].GetNumOfCards(); s++) {
                var index = this.GroupCards[i].Cards[s].GetNumber();
                if (index >= 0 && index < 16) {
                    tuquy[index]++;
                    if (tuquy[index] == 4) // 3
                    {
                        k++; // so bo tu quy
                        number[j++] = index;
                        // trace ("Co tu quy thu ", j, " la ", index);
                    }
                }
            }
        }
        if (k >= 1) {
            for (i = 0; i < k - 1; i++)
                for (j = i + 1; j < k; j++)
                    if (number[i] < number[j]) {
                        var tmp = number[i];
                        number[i] = number[j];
                        number[j] = tmp;
                    }
            return number[0];
        }
        return -1;
    },

    getHas2FailAdvance: function () {
        if (this.GetNumOfGroupCards() == 0)
            return 0;
        var result = 0;
        for (var i = 0; i < this.GroupCards.length; i++) {

            var Cards = this.GroupCards[i].Cards;
            for (var j = 0; j < Cards.length; j++) {
                if (Cards[j].GetNumber() == 15) {
                    switch (Cards[j].GetSuit()) {
                        case 1:
                        case 2:
                            result += 3.0;
                            break;
                        case 3:
                        case 4:
                            result += 6.0;
                            break;
                    }
                }
            }
        }
        return result;
    },

    getNumOf2: function () {
        var result = 0;
        for (var i = 0; i < this.GroupCards.length; i++) {

            var Cards = this.GroupCards[i].Cards;
            for (var j = 0; j < Cards.length; j++) {
                if (Cards[j].GetNumber() == 15) {
                    result++;
                }
            }
        }
        return result;
    },

    has3DoiThongTuQuy: function () {
        if (this.has4DoiThongTuQuy()) {
            if (this.Value.length > 0) {
                if (this.hasTuQuy(this.Value[0]) || this.hasTuQuy(this.Value[this.Value.length - 1]))
                    return false;
            }
        } else if (this.Has3DoiThong()) {
            for (var i = 0; i < this.Value.length; i++) {
                if (this.hasTuQuy(this.Value[i]))
                    return true;
            }
        }
        return false;
    },

    has4DoiThongTuQuy: function () {
        if (this.Has4DoiThong()) {

            for (var i = 0; i < this.Value.length; i++) {
                if (this.hasTuQuy(this.Value[i]))
                    return true;
            }
        }
        return false;
    },

    has5DoiThongTuQuy: function () {
        if (this.HasUltra()) {
            for (var i = 0; i < this.Value.length; i++) {
                if (this.hasTuQuy(this.Value[i]) && i == this.Value.length / 2)
                    return true;
            }
        }
        return false;
    },

    hasTuQuy: function (num) {
        if (num < 0 || num >= 16)
            return false;
        var tuquy = [];
        var i;
        for (i = 0; i < 16; i++)
            tuquy[i] = 0;
        var count = 0;
        for (i = 0; i < this.GroupCards.length; i++) {
            for (var j = 0; j < this.GroupCards[i].Cards.length; j++) {

                var iNum = this.GroupCards[i].Cards[j].GetNumber();
                if (iNum == num)
                    count++;
            }
        }
        return count == 4;
    },

    getNumTuQuy: function () {
        var result = 0;
        var tuquy = [];
        var i;
        for (i = 0; i < 16; i++)
            tuquy[i] = 0;
        for (i = 0; i < this.GroupCards.length; i++) {

            for (var j = 0; j < this.GroupCards[i].Cards.length; j++) {
                var iNum = this.GroupCards[i].Cards[j].GetNumber();
                if (tuquy[iNum] == 0) {
                    if (iNum < 15 && this.hasTuQuy(iNum)) {

                        result++;
                        tuquy[iNum] = 4;
                    }
                }
            }

        }
        return result;
    },

    Has6DoiThong: function () {
        var doi = [];
        var ID = [];
        var i, j = 0, k = 0;
        for (i = 0; i < this.GroupCards.length; i++)
            doi[i] = 0;
        for (i = 0; i < this.GroupCards.length; i++) {
            if (this.GroupCards[i].GetNumber() != 15) // khac quan 2
            {
                var index = this.GroupCards[i].GetNumber();
                if (index >= 0 && index < 20) {
                    doi[index]++;
                    if (doi[index] == 2) // doi
                    {
                        k++;
                        ID[j++] = index;
                    }
                }
            }
        }
        if (k >= 6) {
            for (i = 0; i < 5; i++)
                for (j = i + 1; j < 6; j++)
                    if (ID[i] < ID[j]) // sap xep mang cac doi nho dan
                    {
                        var temp = ID[i];
                        ID[i] = ID[j];
                        ID[j] = temp;
                    }
            for (i = 0; i < 2; i++)
                if (ID[i] > 0) {
                    if (ID[i] - ID[i + 5] == 5) {
                        this.Value = [];
                        for (j = ID[i]; j >= ID[i + 5]; j--)
                            this.Value.push(j);
                        return true;
                    }
                }
        }
        return false;
    },

    getHas2FailEatAll: function () {
        if (this.GetNumOfGroupCards() == 0)
            return 0;
        var result = 0;
        for (var i = 0; i < this.GroupCards.length; i++) {
            var Cards = this.GroupCards[i].Cards;
            for (var j = 0; j < Cards.length; j++) {
                if (Cards[j].GetNumber() == 15) {
                    switch (Cards[j].GetSuit()) {
                        case 1:
                        case 2:
                            result += 1.0;
                            break;
                        case 3:
                        case 4:
                            result += 2.0;
                            break;
                    }
                }
            }
        }
        return result;
    }

});

var TienLenGamePlayer = cc.Class.extend({

    ctor: function () {
        this.WinCards = [];
        this.WinExcess = [];
        this.LostCards = [];
        this.SuddenWin = -1;
    },

    KiemTraBaiThoi: function (c) {
        var nFour = this.NumFour(c);
        var n3Pair = this.Num3DoiThong(c);
        if (nFour >= 2) {
            this.CheckFour(c);
            this.CheckThoiHai(c);
        }
        else if (n3Pair >= 2) {
            this.Thoi3DoiThong(c);
            this.CheckThoiHai(c);
        }
        else {
            var result = this.Check4_3(c);
            if (result == 0) {
                this.Thoi5DoiThong(c);
                this.Thoi4DoiThong(c);
                this.Thoi3DoiThong(c);
                this.CheckFour(c);
                this.CheckThoiHai(c);
            }
            else if (result == 1) {
                this.CheckFour(c);
                this.Thoi4DoiThong(c);
                this.CheckThoiHai(c);
            }
            else if (result == 2) {
                this.CheckFour(c);
                this.Thoi3DoiThong(c);
                this.CheckThoiHai(c);
            }
        }
    },

    getNumCard: function (num, c) {
        var count = 0;
        for (var i = 0; i < c.GetNumOfCards(); i++) {
            if (c.Cards[i].GetNumber() == num)
                count++;
        }
        return count;
    },

    NumFour: function (c) {
        if (c.GetNumOfCards() <= 3)
            return 0;
        var i;
        var num = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];
        for (i = 0; i < c.GetNumOfCards(); i++) {
            if (c.Cards[i].GetNumber() != 15)
                num[c.Cards[i].GetNumber()]++;
        }
        var result = 0;
        for (i = 0; i < 13; i++) {
            if (num[i] >= 3) {
                result++;
            }
        }
        return result;
    },

    Num3DoiThong: function (c) {
        if (c.GetNumOfCards() < 6)
            return 0;
        var i, j, z;
        var n;
        var num = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        var doi = [];
        var k = 0;
        var result = 0;
        for (i = 0; i < c.GetNumOfCards(); i++) {

            n = c.Cards[i].GetNumber();
            num[n] = num[n] + 1;
            if (num[n] == 2)
                doi[k++] = n;
        }
        if (k >= 3) {
            for (i = 0; i < k - 1; i++) {
                for (j = i + 1; j < k; j++) {
                    if (doi[i] < doi[j]) {
                        var tmp = doi[i];
                        doi[i] = doi[j];
                        doi[j] = tmp;
                    }
                }
            }
            var Id = [];
            for (i = 0; i < k - 2; i++) {
                var add = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                if (doi[i] - doi[i + 2] == 2) {
                    var gc = [];
                    for (var x = doi[i]; x >= doi[i + 2]; x--) {
                        for (j = 0; j < c.GetNumOfCards(); j++) {
                            if (c.Cards[j].GetNumber() == x && add[x] < 2) {
                                var b = false;
                                for (z = 0; z < Id.length; z++)
                                    if (Id[z] == c.Cards[j].ID)
                                        b = true;
                                if (!b) {
                                    gc.push(c.Cards[j].ID);
                                    add[x]++;
                                }
                            }
                        }
                    }
                    if (gc.length == 6) {
                        result++;
                        for (j = 0; j < gc.length; j++) {
                            Id.push(gc[j]);
                        }
                    }
                }
            }
        }
        return result;
    },

    Check4_3: function (c) {
        if (c.GetNumOfCards() < 10)
            return 0;

        var i, j;
        var n;
        var num = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        var doi = [];
        var k = 0;
        var result = 0;
        for (i = 0; i < c.GetNumOfCards(); i++) {
            n = c.Cards[i].GetNumber();
            num[n] = num[n] + 1;
            if (num[n] == 2)
                doi[k++] = n;
        }

        if (k >= 5) {
            for (i = 0; i < k - 1; i++) {
                for (j = i + 1; j < k; j++) {
                    if (doi[i] < doi[j]) {
                        var tmp = doi[i];
                        doi[i] = doi[j];
                        doi[j] = tmp;
                    }
                }
            }
            for (i = 0; i < k - 4; i++) {
                var add = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                if (doi[i] - doi[i + 4] == 4) {
                    var gc = [];
                    for (var x = doi[i]; x >= doi[i + 4]; x--) {
                        for (j = 0; j < c.GetNumOfCards(); j++) {
                            if (c.Cards[j].GetNumber() == x && add[x] < 2) {
                                if (!this.CardInWinCards(c.Cards[j].ID)) {
                                    gc.push(c.Cards[j].ID);
                                    add[x]++;
                                }
                            }
                        }
                    }
                    if (gc.length == 10) {
                        for (j = doi[i]; j >= doi[i + 4]; j--) {
                            var nc = this.getNumCard(j, c);
                            if (nc != 4)
                                continue;
                            if (j == doi[i] || j == doi[i + 4]) {
                                result = 1;
                                break;
                            }
                            else if (j == doi[i + 1] || j == doi[i + 3]) {
                                result = 2;
                                break;
                            }
                        }
                    }
                }
            }
        }
        return result;
    },

    Thoi5DoiThong: function (c) {
        if (c.GetNumOfCards() <= 9)
            return false;
        var i, j;
        var n;
        var num = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        var doi = [];
        var k = 0;
        for (i = 0; i < c.GetNumOfCards(); i++) {
            n = c.Cards[i].GetNumber();
            num[n] = num[n] + 1;
            if (num[n] == 2)
                doi[k++] = n;
        }
        if (k >= 5) {
            for (i = 0; i < k - 1; i++) {
                for (j = i + 1; j < k; j++) {
                    if (doi[i] < doi[j]) {
                        var tmp = doi[i];
                        doi[i] = doi[j];
                        doi[j] = tmp;
                    }
                }
            }
            for (i = 0; i < k - 4; i++) {
                var add = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                if (doi[i] - doi[i + 4] == 4) {
                    var gc = [];
                    for (var x = doi[i]; x >= doi[i + 4]; x--) {
                        for (j = 0; j < c.GetNumOfCards(); j++) {
                            if (c.Cards[j].GetNumber() == x && add[x] < 2) {
                                if (!this.CardInWinCards(c.Cards[j].ID)) {
                                    gc.push(c.Cards[j].ID);
                                    add[x]++;
                                }
                            }
                        }
                    }
                    if (gc.length == 10) {
                        for (j = 0; j < gc.length; j++) {
                            this.WinCards.push(gc[j]);
                        }
                    }
                }
            }
            if (this.WinCards.length >= 10) {
                this.WinExcess = [];
                for (j = 0; j < c.GetNumOfCards(); j++) {
                    if (!this.CardInWinCards(c.Cards[j].ID))
                        this.WinExcess.push(c.Cards[j].ID);
                }
                var t = 0;
                for (i = 0; i < c.Cards.length; i++) {
                    if (i < this.WinCards.length)
                        c.Cards[i].ID = this.WinCards[i];
                    else if (t < this.WinExcess.length)
                        c.Cards[i].ID = this.WinExcess[t++];
                }
                return true;
            }
        }
        return false;
    },

    Thoi4DoiThong: function (c) {
        if (c.GetNumOfCards() <= 7)
            return false;
        var i, j;
        var n;
        var num = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        var doi = [];
        var k = 0;
        for (i = 0; i < c.GetNumOfCards(); i++) {
            n = c.Cards[i].GetNumber();
            num[n] = num[n] + 1;
            if (num[n] == 2)
                doi[k++] = n;
        }
        if (k >= 4) {
            for (i = 0; i < k - 1; i++) {
                for (j = i + 1; j < k; j++) {
                    if (doi[i] < doi[j]) {
                        var tmp = doi[i];
                        doi[i] = doi[j];
                        doi[j] = tmp;
                    }
                }
            }
            for (i = 0; i < k - 3; i++) {
                var add = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                if (doi[i] - doi[i + 3] == 3) {
                    var gc = [];
                    for (var x = doi[i]; x >= doi[i + 3]; x--) {
                        for (j = 0; j < c.GetNumOfCards(); j++) {
                            if (c.Cards[j].GetNumber() == x && add[x] < 2) {
                                if (!this.CardInWinCards(c.Cards[j].ID)) {
                                    gc.push(c.Cards[j].ID);
                                    add[x]++;
                                }
                            }
                        }
                    }
                    if (gc.length == 8) {
                        for (j = 0; j < gc.length; j++) {
                            this.WinCards.push(gc[j]);
                        }
                    }
                }
            }
            if (this.WinCards.length >= 8) {
                this.WinExcess = [];
                for (j = 0; j < c.GetNumOfCards(); j++) {
                    if (!this.CardInWinCards(c.Cards[j].ID))
                        this.WinExcess.push(c.Cards[j].ID);
                }
                var t = 0;

                for (i = 0; i < c.Cards.length; i++) {
                    if (i < this.WinCards.length) {
                        c.Cards[i].ID = this.WinCards[i];

                    }
                    else if (t < this.WinExcess.length) {
                        c.Cards[i].ID = this.WinExcess[t];

                        t++;
                    }
                }
                return true;
            }
        }
        return false;
    },

    Thoi3DoiThong: function (c) {
        if (c.GetNumOfCards() <= 5)
            return false;
        var i, j;
        var n;
        var num = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        var doi = [];
        var k = 0;
        for (i = 0; i < c.GetNumOfCards(); i++) {
            n = c.Cards[i].GetNumber();
            num[n] = num[n] + 1;
            if (num[n] == 2)
                doi[k++] = n;
        }
        if (k >= 3) {
            for (i = 0; i < k - 1; i++) {
                for (j = i + 1; j < k; j++) {
                    if (doi[i] < doi[j]) {
                        var tmp = doi[i];
                        doi[i] = doi[j];
                        doi[j] = tmp;
                    }
                }
            }
            for (i = 0; i < k - 2; i++) {
                var add = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                if (doi[i] - doi[i + 2] == 2) {
                    var gc = [];
                    for (var x = doi[i]; x >= doi[i + 2]; x--) {
                        for (j = 0; j < c.GetNumOfCards(); j++) {
                            if (c.Cards[j].GetNumber() == x && add[x] < 2) {
                                if (!this.CardInWinCards(c.Cards[j].ID)) {
                                    gc.push(c.Cards[j].ID);
                                    add[x]++;
                                }
                            }
                        }
                    }
                    if (gc.length == 6) {
                        for (j = 0; j < gc.length; j++) {
                            this.WinCards.push(gc[j]);
                        }
                    }
                }
            }
            if (this.WinCards.length >= 6) {
                this.WinExcess = [];
                for (j = 0; j < c.GetNumOfCards(); j++) {
                    if (!this.CardInWinCards(c.Cards[j].ID))
                        this.WinExcess.push(c.Cards[j].ID);
                }
                var t = 0;

                for (i = 0; i < c.Cards.length; i++) {
                    if (i < this.WinCards.length) {
                        c.Cards[i].ID = this.WinCards[i];

                    }
                    else if (t < this.WinExcess.length) {
                        c.Cards[i].ID = this.WinExcess[t];

                        t++;
                    }
                }
                return true;
            }
        }
        return false;
    },

    CardInWinCards: function (ID) {
        for (var i = 0; i < this.WinCards.length; i++) {
            if (this.WinCards[i] == ID)
                return true;
        }
        return false;
    },

    CardInWinExcess: function (ID) {
        for (var i = 0; i < this.WinExcess.length; i++) {
            if (this.WinExcess[i] == ID)
                return true;
        }
        return false;
    },

    CheckFour: function (c) {

        if (c.GetNumOfCards() <= 3)
            return;
        var i, j;
        var num = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];
        for (i = 0; i < c.GetNumOfCards(); i++) {
            if (c.Cards[i].GetNumber() != 15)
                num[c.Cards[i].GetNumber()]++;
        }
        for (i = 0; i < 13; i++) {
            if (num[i] >= 3) {
                var gc = [];
                for (j = 0; j < c.GetNumOfCards(); j++) {
                    if (c.Cards[j].GetNumber() == i) {
                        if (!this.CardInWinCards(c.Cards[j].ID))
                            gc.push(c.Cards[j].ID);
                    }
                }
                if (gc.length == 4) {
                    for (j = 0; j < gc.length; j++)
                        this.WinCards.push(gc[j]);
                }
            }
        }
        var t = 0;
        if (this.WinCards.length >= 4) {
            this.WinExcess = [];
            for (j = 0; j < c.GetNumOfCards(); j++) {
                if (!this.CardInWinCards(c.Cards[j].ID))
                    this.WinExcess.push(c.Cards[j].ID);
            }
            for (i = 0; i < c.Cards.length; i++) {
                if (i < this.WinCards.length)
                    c.Cards[i].ID = this.WinCards[i];
                else if (t < this.WinExcess.length)
                    c.Cards[i].ID = this.WinExcess[t++];
            }
        }
    },

    CheckThoiHai: function (c) {
        var gc = [];
        var i;
        for (i = 0; i < c.GetNumOfCards(); i++) {
            if (c.Cards[i].GetNumber() == 15) {
                gc.push(c.Cards[i].ID);
            }
        }

        var t = 0;
        if (gc.length > 0) {
            this.WinExcess = [];
            for (i = 0; i < gc.length; i++) {
                this.WinCards.push(gc[i]);
            }
            for (i = 0; i < c.GetNumOfCards(); i++) {
                if (!this.CardInWinCards(c.Cards[i].ID)) {
                    this.WinExcess.push(c.Cards[i].ID);
                }
            }

            for (i = 0; i < c.Cards.length; i++) {
                if (i < this.WinCards.length) {
                    c.Cards[i].ID = this.WinCards[i];
                } else if (t < this.WinExcess.length) {
                    c.Cards[i].ID = this.WinExcess[t];
                    t++;
                }
            }
        }
    },

    CheckStraight: function (c) {
        this.WinCards.push(c.Cards[0].ID);
        var n = 0;
        for (var i = 1; i < c.GetNumOfCards(); i++) {
            if (c.Cards[i].GetNumber() != 15) {
                n = this.WinCards[this.WinCards.length - 1] / 4;
                if (c.Cards[i].GetNumber() == n + 3 + 1) {
                    this.WinCards.push(c.Cards[i].ID);
                } else
                    this.WinExcess.push(c.Cards[i].ID);
            } else
                this.WinExcess.push(c.Cards[i].ID);

        }

        for (var i = 0; i < c.Cards.length; i++) {
            if (i <= 11)
                c.Cards[i].ID = this.WinCards[i];
            else
                c.Cards[i].ID = this.WinExcess[0];
        }

    },

    CheckSixPair: function (c) {
        for (var i = 0; i < c.GetNumOfCards() - 1; i++) {
            if (c.Cards[i].GetNumber() == c.Cards[i + 1].GetNumber()) {
                this.WinCards.push(c.Cards[i].ID);
                this.WinCards.push(c.Cards[i + 1].ID);
                i++;
            }
        }

        var kt = false;
        for (var i = 0; i < c.GetNumOfCards(); i++) {
            for (var j = 0; j < this.WinCards.length; j++) {
                if (c.Cards[i].ID == this.WinCards[j]) {
                    kt = true;
                    break;
                }
            }
            if (!kt)
                this.WinExcess.push(c.Cards[i].ID);
            kt = false;
        }

        for (var i = 0; i < c.Cards.length; i++) {
            if (i <= 11)
                c.Cards[i].ID = this.WinCards[i];
            else
                c.Cards[i].ID = this.WinExcess[0];
        }

    },

    CheckFour2: function (c) {
        this.WinCards.push(48);
        this.WinCards.push(49);
        this.WinCards.push(50);
        this.WinCards.push(51);

        for (var i = 0; i < c.Cards.length; i++)
            if (c.Cards[i].GetNumber() != 15)
                this.WinExcess.push(c.Cards[i].ID);
        var k = 0;
        for (var i = 0; i < c.Cards.length; i++) {
            if (i <= 3)
                c.Cards[i].ID = this.WinCards[i];
            else
                c.Cards[i].ID = this.WinExcess[k++];
        }
    },

    CheckFour3: function (c) {
        this.WinCards.push(0);
        this.WinCards.push(1);
        this.WinCards.push(2);
        this.WinCards.push(3);

        for (var i = 0; i < c.Cards.length; i++)
            if (c.Cards[i].GetNumber() != 3)
                this.WinExcess.push(c.Cards[i].ID);
        var k = 0;
        for (var i = 0; i < c.Cards.length; i++) {
            if (i <= 3)
                c.Cards[i].ID = this.WinCards[i];
            else
                c.Cards[i].ID = this.WinExcess[k++];
        }
    },

    CheckUltra: function (c) {
        for (var i = 0; i < c.Cards.length; i++) {
            var size = c.Cards.length - 2;
            if (i <= size) {
                if (c.Cards[i].GetNumber() == c.Cards[i + 1].GetNumber()) {
                    this.WinCards = [];
                    this.WinCards.push(c.Cards[i].ID);
                    var k = 1;
                    for (var j = i + 1; j < c.Cards.length; j++) {
                        var number = this.WinCards[this.WinCards.length - 1] / 4 + 3;
                        if (k == 1) // 1 card
                        {
                            if (c.Cards[j].GetNumber() == number) {
                                this.WinCards.push(c.Cards[j].ID);
                                k++;
                                continue;
                            } else {
                                this.WinCards.splice(this.WinCards.length - 1, 1);
                                break;
                            }
                        }

                        if (k == 2) // 2 card
                        {
                            if (c.Cards[j].GetNumber() == number + 1) {
                                this.WinCards.push(c.Cards[j].ID);
                                k--;
                            }
                        }
                    }

                    if (this.WinCards.length == 10)
                        break;
                }
            }
        }

        var kt = false; // day nhung cay bai ko thuoc 5 doi thong vao
        // WinExcess
        for (var i = 0; i < c.GetNumOfCards(); i++) {
            for (var j = 0; j < this.WinCards.length; j++) {
                if (c.Cards[i].ID == this.WinCards[j]) {
                    kt = true;
                }
            }

            if (!kt) {
                this.WinExcess.push(c.Cards[i].ID);
            } else {
                kt = false;
            }

        }

        var t = 0;
        if (this.WinCards.length == 10) // sap xep lai GourpCard C -. De sap xep
        // hien thi
            for (var i = 0; i < c.Cards.length; i++)
                if (i <= 9)
                    c.Cards[i].ID = this.WinCards[i];
                else
                    c.Cards[i].ID = this.WinExcess[t++];
    },

    CheckSuper: function (c) {
        for (var i = 0; i < c.Cards.length; i++) {
            var size = c.Cards.length - 2;
            if (i <= size) {
                if (c.Cards[i].GetNumber() == c.Cards[i + 1].GetNumber()) {
                    this.WinCards = [];
                    this.WinCards.push(c.Cards[i].ID);
                    var k = 1;
                    for (var j = i + 1; j < c.Cards.length; j++) {
                        var number = this.WinCards[this.WinCards.length - 1] / 4 + 3;
                        if (k == 1) // 1 card
                        {
                            if (c.Cards[j].GetNumber() == number) {
                                this.WinCards.push(c.Cards[j].ID);
                                k++;
                                continue;
                            } else {
                                this.WinCards.splice(this.WinCards.length - 1, 1);
                                break;
                            }
                        }

                        if (k == 2) // 2 card
                        {
                            if (c.Cards[j].GetNumber() == number + 1) {
                                this.WinCards.push(c.Cards[j].ID);
                                k--;
                            }
                        }
                    }

                    if (this.WinCards.length == 8)
                        break;
                }
            }
        }

        var kt = false; // day nhung cay bai ko thuoc 5 doi thong vao
        // WinExcess
        for (var i = 0; i < c.GetNumOfCards(); i++) {
            for (var j = 0; j < this.WinCards.length; j++) {
                if (c.Cards[i].ID == this.WinCards[j]) {
                    kt = true;
                }
            }

            if (!kt) {
                this.WinExcess.push(c.Cards[i].ID);
            } else {
                kt = false;
            }

        }

        var t = 0;
        if (this.WinCards.length == 8) // sap xep lai GourpCard C -. De sap xep
        // hien thi
            for (var i = 0; i < c.Cards.length; i++)
                if (i <= 7)
                    c.Cards[i].ID = this.WinCards[i];
                else
                    c.Cards[i].ID = this.WinExcess[t++];
    },

    CheckBigger: function (c) {
        for (var i = 0; i < c.Cards.length; i++) {
            var size = c.Cards.length - 2;
            if (i <= size) {
                if (c.Cards[i].GetNumber() == c.Cards[i + 1].GetNumber()) {
                    this.WinCards = [];
                    this.WinCards.push(c.Cards[i].ID);
                    var k = 1;
                    for (var j = i + 1; j < c.Cards.length; j++) {
                        var number = this.WinCards[this.WinCards.length - 1] / 4 + 3;
                        if (k == 1) // 1 card
                        {
                            if (c.Cards[j].GetNumber() == number) {
                                this.WinCards.push(c.Cards[j].ID);
                                k++;
                                continue;
                            } else {
                                this.WinCards.splice(this.WinCards.length - 1, 1);
                                break;
                            }
                        }

                        if (k == 2) // 2 card
                        {
                            if (c.Cards[j].GetNumber() == number + 1) {
                                this.WinCards.push(c.Cards[j].ID);
                                k--;
                            }
                        }
                    }

                    if (this.WinCards.length == 6)
                        break;
                }
            }
        }

        var kt = false; // day nhung cay bai ko thuoc 5 doi thong vao
        // WinExcess
        for (var i = 0; i < c.GetNumOfCards(); i++) {
            for (var j = 0; j < this.WinCards.length; j++) {
                if (c.Cards[i].ID == this.WinCards[j]) {
                    kt = true;
                }
            }

            if (!kt) {
                this.WinExcess.push(c.Cards[i].ID);
            } else {
                kt = false;
            }

        }

        var t = 0;
        if (this.WinCards.length == 6) // sap xep lai GourpCard C -. De sap xep hien
        // thi
            for (var i = 0; i < c.Cards.length; i++)
                if (i <= 5)
                    c.Cards[i].ID = this.WinCards[i];
                else
                    c.Cards[i].ID = this.WinExcess[t++];
    }

});

var TienLenGameLogic = cc.Class.extend({

    ctor: function () {

    },

    CompareGroupCardsBySuit: function (GroupCard1, GroupCard2) {
        if (GroupCard1.GetSuit() == GroupCard2.GetSuit()) {
            if (GroupCard1.GetNumber() < GroupCard1.GetNumber())
                return -1;
            else
                return 1;
        } else {
            if (GroupCard1.GetSuit() < GroupCard2.GetSuit())
                return -1;
            else
                return 1;
        }
    }
});

var TienLenRule = cc.Class.extend({});

TienLenPlayerCard.CARD = 1;

TienLenGroupCard.EG_SEQUENCE = 1;
TienLenGroupCard.EG_NORMAL = 2;
TienLenGroupCard.EG_NONE = 3;
TienLenGroupCard.EG_ONECARD = 4;
TienLenGroupCard.EG_SUPER = 5;
TienLenGroupCard.EG_ULTRA = 6;
TienLenGroupCard.EG_BIGGER = 7;
TienLenGroupCard.EG_BA_CON_HAI = 8;
TienLenGroupCard.EG_DOI_HAI = 9;
TienLenGroupCard.EG_TU_QUY = 10;

TienLenGamePlayer.ST_ULTRA = 0;
TienLenGamePlayer.ST_FOUR_3 = 1;
TienLenGamePlayer.ST_FOUR_2 = 2;
TienLenGamePlayer.ST_STRAIGHT = 3;
TienLenGamePlayer.ST_SIXPAIR = 4;
TienLenGamePlayer.ST_NONE = 5;
TienLenGamePlayer.ST_13LA = 6;
TienLenGamePlayer.ST_BIGGER = 7;
TienLenGamePlayer.ST_SUPER = 8;

TienLenRule.E_WRONG_SUIT = 1;
TienLenRule.E_WRONG_NUMBER = 2;
TienLenRule.E_WRONG_GROUP = 3;
TienLenRule.E_2_LAST = 4;
TienLenRule.E_NO_ERROR = 5;
TienLenRule.E_TU_QUY = 6;

TienLenGameLogic.AM_NORMAL = 0;
TienLenGameLogic.AM_NUMBER = 1;
TienLenGameLogic.CurrentArrangeMode = 0;

TienLenGameLogic.sortGroupCards = function (listGroup, inc) {
    for (var i = 0; i < listGroup.length; i++) {
        for (var j = i; j < listGroup.length; j++) {
            var result = TienLenGameLogic.CompareGroupCards(listGroup[i], listGroup[j]);
            if ((result > 0 && inc) || (result < 0 && !inc)) {

                var tmp = listGroup[i];
                listGroup[i] = listGroup[j];
                listGroup[j] = tmp;
            }
        }
    }
    return listGroup;
};

TienLenGameLogic.sortGroupCardsByNumber = function (listGroup, inc) {
    for (var i = 0; i < listGroup.length; i++) {
        for (var j = i; j < listGroup.length; j++) {

            var result = TienLenGameLogic.CompareGroupCardsByNumber(listGroup[i], listGroup[j]);
            if ((result > 0 && inc) || (result < 0 && !inc)) {
                var tmp = listGroup[i];
                listGroup[i] = listGroup[j];
                listGroup[j] = tmp;
            }
        }
    }
    return listGroup;
};

TienLenGameLogic.CompareGroupCards = function (GroupCard1, GroupCard2) {
    var GroupCardValue = [0, 0];

    for (var i = 0; i < GroupCard1.Cards.length; i++) {
        GroupCardValue[0] += GroupCard1.Cards[i].GetNumber();
    }

    for (var i = 0; i < GroupCard2.Cards.length; i++) {
        GroupCardValue[1] += GroupCard2.Cards[i].GetNumber();
    }

    // Xep doi thong dau tien
    if (GroupCard1.HasDoiThong() && !GroupCard2.HasDoiThong())
        return -1;
    else if (!GroupCard1.HasDoiThong() && GroupCard2.HasDoiThong())
        return 1;
    // Xep tu quy dau tien
    else if (GroupCard1.HasTuQuy() && !GroupCard2.HasTuQuy())
        return -1;
    else if (!GroupCard1.HasTuQuy() && GroupCard2.HasTuQuy())
        return 1;
    else if (GroupCard1.HasTuQuy() && GroupCard2.HasTuQuy()) {
        if (GroupCardValue[0] < GroupCardValue[1]) {
            return -1;
        } else {
            return 1;
        }
    }

    if (GroupCard1.GetNumOfCards() == GroupCard2.GetNumOfCards()) {
        if (GroupCardValue[0] == GroupCardValue[1]) {
            if (GroupCard1.GetSuit() < GroupCard2.GetSuit()) {
                return -1;
            } else {
                return 1;
            }
        } else {
            if (GroupCardValue[0] < GroupCardValue[1]) {
                return -1;
            } else {
                return 1;
            }
        }
    } else {
        if (GroupCard1.GetNumOfCards() > GroupCard2.GetNumOfCards()) {
            return -1;
        } else {
            return 1;
        }
    }
};

TienLenGameLogic.sortCards = function (listCard, inc) {
    for (var i = 0; i < listCard.length; i++) {
        for (var j = i; j < listCard.length; j++) {
            var result = TienLenGameLogic.CompareCardsInGroup(listCard[i], listCard[j]);
            if ((result > 0 && inc) || (result < 0 && !inc)) {
                var tmp = listCard[i];
                listCard[i] = listCard[j];
                listCard[j] = tmp;
            }
        }
    }
    return listCard;
};

TienLenGameLogic.CompareCardsInGroup = function (Card1, Card2) {
    if (Card1.GetNumber() == Card2.GetNumber()) {
        // These cards are equal in value, check their suit
        if (Card1.GetSuit() < Card2.GetSuit()) {
            return -1;
        } else {
            return 1;
        }
    } else {
        if (Card1.GetNumber() < Card2.GetNumber()) {
            return -1;
        } else {
            return 1;
        }
    }
};

TienLenGameLogic.CompareGroupCardsByNumber = function (GroupCard1, GroupCard2) {
    if (GroupCard1.GetNumber() == GroupCard2.GetNumber()) {
        if (GroupCard1.GetSuit() < GroupCard2.GetSuit())
            return -1;
        else
            return 1;
    } else {
        if (GroupCard1.GetNumber() < GroupCard2.GetNumber())
            return -1;
        else
            return 1;
    }
};

TienLenGameLogic.ScanGroupCardNormal = function (PlayerCards) {
    TienLenGameLogic.CurrentArrangeMode = TienLenGameLogic.AM_NORMAL;
    TienLenGameLogic.ScanGroupCard(PlayerCards, TienLenGameLogic.CurrentArrangeMode);
    TienLenGameLogic.CurrentArrangeMode++;
    TienLenGameLogic.CurrentArrangeMode %= 2;
};

TienLenGameLogic.ScanGroupCardAuto = function (PlayerCards) {
    TienLenGameLogic.ScanGroupCard(PlayerCards, TienLenGameLogic.CurrentArrangeMode);
    TienLenGameLogic.CurrentArrangeMode++;
    TienLenGameLogic.CurrentArrangeMode %= 2;
};

TienLenGameLogic.ScanGroupCard = function (PlayerCards, arrangeMode) {
    var TempCards = [];
    var CurrentPlayerCards = PlayerCards;

    for (var i = 0; i < CurrentPlayerCards.GetNumOfGroupCards(); i++) {
        for (var j = 0; j < CurrentPlayerCards.GroupCards[i].Cards.length; j++) {
            TempCards.push(CurrentPlayerCards.GroupCards[i].Cards[j]);
        }
    }
    var SortGroupCard = [];
    var GroupCardResult = [];

    switch (arrangeMode) {
        case TienLenGameLogic.AM_NORMAL:
        {
            var fourGroupCard;
            var cardFound;
            var cardsNumber = [0, 0, 0, 0];
            if (TempCards.length > 3) {
                for (var i = 0; i < TempCards.length; i++) {
                    fourGroupCard = new TienLenGroupCard();

                    cardFound = 0;
                    fourGroupCard.Cards = [];
                    for (var temp = 0; temp < 4; temp++)
                        cardsNumber[temp] = 0;
                    fourGroupCard.AddCard(TempCards[i]);
                    cardsNumber[cardFound] = i;

                    for (var j = i + 1; j < TempCards.length; j++) {
                        if (TempCards[i].GetNumber() == TempCards[j].GetNumber()) {
                            fourGroupCard.AddCard(TempCards[j]);
                            cardFound++;
                            cardsNumber[cardFound] = j;
                        }

                        if (fourGroupCard.GetNumOfCards() == 4) {
                            GroupCardResult.push(fourGroupCard);
                            for (var temp = 0; temp < 4; temp++) {
                                TempCards.splice(cardsNumber[temp], 1);
                                if (temp < 3) {
                                    cardsNumber[temp + 1] -= 1 + temp;
                                }
                            }
                            break;
                        }
                    }
                }
            }

            var tempGroupCard;
            var cardNumber;
            var insertGroup;
            var groupDoiThong;
            var t = 0;
            while (TempCards.length > 2) {
                SortGroupCard = [];
                TempCards = TienLenGameLogic.sortCards(TempCards, true);
                for (var i = 0; i < TempCards.length; i++) {
                    tempGroupCard = new TienLenGroupCard();
                    cardNumber = new TienLenCard();
                    t = 0;
                    tempGroupCard.Cards = [];
                    cardNumber = TempCards[i];
                    tempGroupCard.AddCard(cardNumber);
                    for (var j = i + 1; j < TempCards.length; j++) {
                        if (TempCards[j].GetNumber() < 15) {
                            if (TempCards[j].GetNumber() == cardNumber.GetNumber() + 1) {
                                cardNumber = TempCards[j];
                                tempGroupCard.AddCard(cardNumber);
                                t = j;
                            }
                        }
                    }

                    if (tempGroupCard.GetNumOfCards() >= 3) {
                        var size = TempCards.length - 1;
                        if (t < size) {
                            while (TempCards[t].GetNumber() == TempCards[t + 1].GetNumber()) {
                                tempGroupCard.Cards.splice(tempGroupCard.Cards.length - 1, 1);
                                tempGroupCard.Cards.push(TempCards[t + 1]);
                                t++;
                                if (t == size)
                                    break;
                            }
                        }
                        SortGroupCard.push(tempGroupCard);
                    }
                }

                for (var i = 0; i < TempCards.length; i++) {
                    var size = TempCards.length - 2;
                    if (i <= size) {
                        if (TempCards[i].GetNumber() == TempCards[i + 1].GetNumber()) {
                            groupDoiThong = new TienLenGroupCard();
                            groupDoiThong.AddCard(TempCards[i]);
                            var k = 1;
                            for (var j = i + 1; j < TempCards.length; j++) {
                                if (k == 1) {
                                    if (TempCards[j].GetNumber() == groupDoiThong.Cards[groupDoiThong.Cards.length - 1].GetNumber()) {
                                        groupDoiThong.AddCard(TempCards[j]);
                                        k++;
                                        continue;
                                    } else {
                                        groupDoiThong.Cards.splice(groupDoiThong.Cards.length - 1, 1);
                                        break;
                                    }
                                }

                                if (k == 2) {
                                    if (TempCards[j].GetNumber() == groupDoiThong.Cards[groupDoiThong.Cards.length - 1].GetNumber() + 1 && TempCards[j].GetNumber() < 15) {
                                        groupDoiThong.AddCard(TempCards[j]);
                                        k--;
                                    }
                                }
                            }

                            if (groupDoiThong.GetNumOfCards() >= 6) {

                                if (groupDoiThong.GetNumOfCards() % 2 == 0)
                                    SortGroupCard.push(groupDoiThong);
                                else {
                                    groupDoiThong.Cards.splice(groupDoiThong.Cards.length - 1, 1);
                                    SortGroupCard.push(groupDoiThong);
                                }
                            }
                        }
                    }
                }
                if (SortGroupCard.length >= 1) {
                    SortGroupCard = TienLenGameLogic.sortGroupCards(SortGroupCard, true);
                    insertGroup = new TienLenGroupCard();
                    insertGroup = SortGroupCard[0];
                    SortGroupCard.splice(0, 1);
                    GroupCardResult.push(insertGroup);

                    for (var i = 0; i < insertGroup.GetNumOfCards(); i++) {
                        for (var j = 0; j < TempCards.length; j++) {
                            if (TempCards[j].ID == insertGroup.Cards[i].ID) {
                                TempCards.splice(j, 1);
                                break;
                            }
                        }
                    }
                } else
                    break;

            }
            var j;
            if (TempCards.length > 2) {
                TempCards = TienLenGameLogic.sortCards(TempCards, true);
                for (var i = 0; i < TempCards.length;) {
                    tempGroupCard = new TienLenGroupCard();
                    tempGroupCard.Cards = [];
                    tempGroupCard.AddCard(TempCards[i]);
                    for (j = i + 1; j < TempCards.length; j++) {

                        if (TempCards[i].GetNumber() == TempCards[j].GetNumber()) {
                            tempGroupCard.AddCard(TempCards[j]);
                        } else {
                            break;
                        }
                    }
                    i = j;
                    GroupCardResult.push(tempGroupCard);
                }
                SortGroupCard = TienLenGameLogic.sortGroupCards(SortGroupCard, true);
            } else if (TempCards.length > 0) {
                TempCards = TienLenGameLogic.sortCards(TempCards, true);
                for (var i = 0; i < TempCards.length; i++) {
                    tempGroupCard = new TienLenGroupCard();
                    tempGroupCard.Cards = [];
                    tempGroupCard.AddCard(TempCards[i]);
                    GroupCardResult.push(tempGroupCard);
                }
                GroupCardResult = TienLenGameLogic.sortGroupCards(GroupCardResult, true);
            }
            GroupCardResult = TienLenGameLogic.sortGroupCards(GroupCardResult, true);
        }
            break;

        case TienLenGameLogic.AM_NUMBER:
        {
            for (var i = 0; i < TempCards.length; i++) {
                var TempGroupCard = new TienLenGroupCard();
                TempGroupCard.Cards = [];
                var insertTempCard = new TienLenCard();
                insertTempCard.ID = TempCards[i].ID;
                TempGroupCard.AddCard(insertTempCard);
                GroupCardResult.push(TempGroupCard);
                GroupCardResult = TienLenGameLogic.sortGroupCardsByNumber(GroupCardResult, true);
            }
        }
            break;
    }
    if (GroupCardResult.length > 0) {
        for (var i = 0; i < GroupCardResult.length; i++) {
            GroupCardResult[i].Cards = TienLenGameLogic.sortCards(GroupCardResult[i].Cards, true);
        }
        CurrentPlayerCards.GroupCards = [];
        CurrentPlayerCards.GroupCards = GroupCardResult;
    }
};

TienLenRule.CheckValidCard = function (LastCards, FollowCards, PlayerCards) {

    if (FollowCards.GetNumOfCards() <= 0 || LastCards.GetNumOfCards() < 0)
        return TienLenRule.E_WRONG_GROUP;

    for (var CardID = 0; CardID < FollowCards.GetNumOfCards(); CardID++) {
        var CardResult = 0;
        CardResult = PlayerCards.SearchCard(FollowCards.Cards[CardID]);
        if (CardResult == -1) {
            return TienLenRule.E_WRONG_NUMBER;
        }
    }

    if (FollowCards.GetGroupKind() == TienLenGroupCard.EG_NONE) {

        return TienLenRule.E_WRONG_GROUP;
    }

    if (LastCards.GetNumOfCards() == 0) {
        return TienLenRule.E_NO_ERROR;
    }

    if (FollowCards.GetGroupKind() == TienLenGroupCard.EG_SUPER) {
        if ((LastCards.GetNumOfCards() == 1) || (LastCards.GetNumOfCards() == 2)) {
            if (LastCards.GetNumber() != 15) {
                return TienLenRule.E_WRONG_GROUP;
            }
            else
                return TienLenRule.E_NO_ERROR;
        }
        else if (LastCards.GetGroupKind() == TienLenGroupCard.EG_BIGGER) {
            return TienLenRule.E_NO_ERROR;
        }
        else if (LastCards.GetGroupKind() == TienLenGroupCard.EG_SUPER) {
            if (FollowCards.GetNumber() < LastCards.GetNumber()) {
                return TienLenRule.E_WRONG_NUMBER;
            }
            if (FollowCards.GetNumber() == LastCards.GetNumber()) {
                if (FollowCards.GetBiggestSuit() < LastCards.GetBiggestSuit())
                    return TienLenRule.E_WRONG_GROUP;
            }
            return TienLenRule.E_NO_ERROR;
        }
        else if (LastCards.GetNumOfCards() == 4) {
            if (LastCards.GetGroupKind() == TienLenGroupCard.EG_NORMAL) {
                return TienLenRule.E_NO_ERROR;
            }
        }
        return TienLenRule.E_WRONG_GROUP;
    }

    if (FollowCards.GetGroupKind() == TienLenGroupCard.EG_ULTRA) {
        if (LastCards.GetNumOfCards() == 3) {
            if (LastCards.Cards[0].GetNumber() == 15)
                return TienLenRule.E_WRONG_GROUP;
        }
        return TienLenRule.E_NO_ERROR;
    }

    if (FollowCards.GetNumOfCards() != LastCards.GetNumOfCards()) {
        var tuqui = false;
        var BiggerGroup = false;
        if (LastCards.GetNumOfCards() == 1) {
            if (LastCards.GetNumber() == 15) {
                if (FollowCards.GetNumOfCards() == 4) {
                    if (FollowCards.GetGroupKind() == TienLenGroupCard.EG_NORMAL)
                        tuqui = true;
                }
                if (FollowCards.GetNumOfCards() == 6) {
                    if (FollowCards.GetGroupKind() == TienLenGroupCard.EG_BIGGER)
                        BiggerGroup = true;
                }
            }
        }
        else if (LastCards.GetNumOfCards() == 2) {

            if (LastCards.GetNumber() == 15) {

                if (FollowCards.GetNumOfCards() == 4) {

                    if (FollowCards.GetGroupKind() == TienLenGroupCard.EG_NORMAL) {

                        tuqui = true;
                    }
                }
            }
        }
        else if (LastCards.GetNumOfCards() == 6) {
            if (LastCards.GetGroupKind() == TienLenGroupCard.EG_BIGGER) {
                if (FollowCards.GetNumOfCards() == 4) {
                    if (FollowCards.GetGroupKind() == TienLenGroupCard.EG_NORMAL)
                        BiggerGroup = true;
                }
            }
        }
        if (tuqui) {
            return TienLenRule.E_TU_QUY;
        }
        else if (BiggerGroup) {
            return TienLenRule.E_NO_ERROR;
        }
        else
            return TienLenRule.E_WRONG_GROUP;
    }

    if (FollowCards.GetGroupKind() == TienLenGroupCard.EG_BIGGER) {
        if (LastCards.GetGroupKind() == TienLenGroupCard.EG_BIGGER) {
            if (FollowCards.GetNumber() < LastCards.GetNumber())
                return TienLenRule.E_WRONG_NUMBER;
            if (FollowCards.GetNumber() == LastCards.GetNumber()) {
                if (FollowCards.GetBiggestSuit() < LastCards.GetBiggestSuit())
                    return TienLenRule.E_WRONG_GROUP;
            }
            return TienLenRule.E_NO_ERROR;
        }
    }

    switch (FollowCards.GetGroupKind()) {
        case TienLenGroupCard.EG_ONECARD:
        case TienLenGroupCard.EG_NORMAL:
        {
            if (FollowCards.GetNumber() == LastCards.GetNumber()) {
                if (FollowCards.GetBiggestSuit() < LastCards.GetBiggestSuit())
                    return TienLenRule.E_WRONG_SUIT;
            }
            if (FollowCards.GetNumber() < LastCards.GetNumber()) {
                cc.log("step 2.1");
                return TienLenRule.E_WRONG_NUMBER;
            }

            if (LastCards.GetGroupKind() == TienLenGroupCard.EG_SEQUENCE) {
                cc.log("step 2.1");
                return TienLenRule.E_WRONG_NUMBER;
            }

            return TienLenRule.E_NO_ERROR;
        }
        case TienLenGroupCard.EG_SEQUENCE:
        {
            if ((LastCards.GetGroupKind() == TienLenGroupCard.EG_SUPER) || (LastCards.GetGroupKind() == TienLenGroupCard.EG_BIGGER)) {
                return TienLenRule.E_WRONG_GROUP;
            }
            if (FollowCards.GetNumber() < LastCards.GetNumber())
                return TienLenRule.E_WRONG_NUMBER;
            if (FollowCards.GetNumber() == LastCards.GetNumber()) {
                if (FollowCards.GetBiggestSuit() < LastCards.GetBiggestSuit())
                    return TienLenRule.E_WRONG_GROUP;
            }
            if (LastCards.GetGroupKind() == TienLenGroupCard.EG_NORMAL) {
                return TienLenRule.E_WRONG_NUMBER;
            }
            return TienLenRule.E_NO_ERROR;
        }
    }

    return TienLenRule.E_WRONG_NUMBER;

};
