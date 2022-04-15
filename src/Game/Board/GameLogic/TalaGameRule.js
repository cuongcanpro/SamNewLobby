/**
 * Created by GSN on 1/14/2016.
 */

var TalaSuit = cc.Class.extend({
    ctor: function()
    {
        this.cards = [];
        this.suitType = 0;
    },
    clone: function(){
        var clone = new TalaSuit();
        clone.suitType = this.suitType;
        for(var i=0;i<this.cards.length;i++)
        {
            clone.cards.push(this.cards[i].clone());
        }
        return clone;
    },
    genSuitType: function()
    {
        if(this.cards[0].cardType == this.cards[1].cardType)
        {
            this.suitType = 0;
        }
        else
            this.suitType = 1;
        return this.suitType;
    }

})

var TalaSolution = cc.Class.extend({
    ctor: function()
    {
        this.suit = [];
    },
    length: function()
    {
        return this.suit.length
    }
})

var TalaCardTestTable = cc.Class.extend({
    ctor: function()
    {
        this.cards = [];
        for(var i =0 ;i<Card.kQuanbai_NONE;i++)
        {
            var array = [];
            for(var j=0;j<Card.kChat_NODE;j++)
            {
                array.push(new Card(-1));
            }
            this.cards.push(array);
        }
    }
})

var TalaGameRule = cc.Class.extend({
})

TalaGameRule.makeCardTestTable = function(group1)
{
    var ret = new TalaCardTestTable();
    for(var i=0;i<group1.cards.length;i++)
    {
        if (!ret.cards[group1.cards[i].cardType] || !ret.cards[group1.cards[i].cardType][group1.cards[i].cardShape]){
            group1.cards[i] = new Card(group1.cards[i].id);

            if (!ret.cards[group1.cards[i].cardType]){
                continue;
            }
        }

        if (ret.cards[group1.cards[i].cardType] || ret.cards[group1.cards[i].cardType][group1.cards[i].cardShape]){
            ret.cards[group1.cards[i].cardType][group1.cards[i].cardShape] = group1.getCard(i);
        } else {
            cc.log("loi roi: " + JSON.stringify(group1.cards[i]));
        }
    }
    return ret;
};

TalaGameRule.addSuit = function(allSuit,card0,card1,card2,typeSuit){
    var count = 0;
    // ko cho ghep 2 quan isEaten vao 1 suit
    if (card0.isEaten)
        count++;
    if (card1.isEaten)
        count++;
    if (card2.isEaten)
        count++;
    if (count >= 2)
        return;
    // update info
    card0.isInSuit = true;
    card1.isInSuit = true;
    card2.isInSuit = true;
    var suit = new TalaSuit();
    suit.cards.push(new Card(card0));
    suit.cards.push(new Card(card1));
    suit.cards.push(new Card(card2));
    suit.suitType = typeSuit;

    allSuit.push(suit);
};

TalaGameRule.findAllSuit = function(group1)
{
    var retVal = [];
    var table = TalaGameRule.makeCardTestTable(group1);
    for(var i=0;i<group1.cards.length;i++)
    {
        group1.cards[i].isInSuit = false;
    }

    // Tim bo cung so
    var myTry = [false,false,false,false];
    for (var i = 0; i < Card.kQuanbai_NONE; i++) {
        for (var j = 0; j < Card.kChat_NODE; j++) {
            if (table.cards[i][j].id > -1) {
                myTry[j] = true;
            } else {
                myTry[j] = false;
            }
        }
        // chon 3 trong 4 quan
        if (myTry[0] && myTry[1] && myTry[2]) {
            TalaGameRule.addSuit(retVal, group1.cards[group1.findCard(table.cards[i][0].id)], group1.cards[group1.findCard(table.cards[i][1].id)], group1.cards[group1.findCard(table.cards[i][2].id)], 0);
        }
        if (myTry[0]&& myTry[1] && myTry[3] ) {
            TalaGameRule.addSuit(retVal, group1.cards[group1.findCard(table.cards[i][0].id)], group1.cards[group1.findCard(table.cards[i][1].id)], group1.cards[group1.findCard(table.cards[i][3].id)], 0);
        }
        if (myTry[0]&& myTry[2] && myTry[3]) {
            TalaGameRule.addSuit(retVal, group1.cards[group1.findCard(table.cards[i][0].id)], group1.cards[group1.findCard(table.cards[i][2].id)], group1.cards[group1.findCard(table.cards[i][3].id)], 0);
        }
        if (myTry[1] && myTry[2] && myTry[3] ) {
            TalaGameRule.addSuit(retVal, group1.cards[group1.findCard(table.cards[i][1].id)], group1.cards[group1.findCard(table.cards[i][2].id)], group1.cards[group1.findCard(table.cards[i][3].id)], 0);
        }
    }

            // tim bo cung chat
            for (var i = 0; i < Card.kQuanbai_NONE - 2; i++) {
                for (var j = 0; j < Card.kChat_NODE; j++) {
                    if ((table.cards[i][j].id != -1) && (table.cards[i + 1][j].id != -1) && (table.cards[i + 2][j].id != -1)) {
                        TalaGameRule.addSuit(retVal, group1.cards[group1.findCard(table.cards[i][j].id)], group1.cards[group1.findCard(table.cards[i+1][j].id)], group1.cards[group1.findCard(table.cards[i+2][j].id)], 1);
                    }
                }
            }

            return retVal;

}


TalaGameRule.kiemtraTrungQuan = function(s1,s2)
{
    for (var i = 0; i < s1.cards.length; i++) {
        for (var j = 0; j < s2.cards.length; j++) {
            if (s1.cards[i].id == s2.cards[j].id) {
                return false;
            }
        }
    }
    return true;
}

TalaGameRule.addSolution = function(allSolution,s1,s2,s3,nEatCard)
{
    var sol = new TalaSolution();
    if (s1.cards.length > 0) {
        sol.suit.push(s1);
    }
    if (s2.cards.length > 0) {
        sol.suit.push(s2);
    }
    if (s3.cards.length > 0) {
        sol.suit.push(s3);
    }
    // check numEatCard
    var count = 0;
    for (var i = 0; i < sol.suit.length; i++) {
        var s = sol.suit[i];
        for (var j = 0; j < s.cards.length; j++) {
            if (s.cards[j].isEaten) {
                count++;
            }
        }
    }
    if (count != nEatCard) {
        return false;
    }
    // add solution
    if (sol.suit.length > 0) {
        allSolution.push(sol);
        return true;
    }
    return false;
}

TalaGameRule.addCardsToSuit = function(suit,g1)
{
    if ((suit.cards.length < 1) || (suit.cards.length >= 20)) {
        return;
    }
    var check = false;
    var card = new Card();
    for (var i = 0; i < g1.cards.length; i++) {
        card = g1.getCard(i);
        if (card.id == -1) {
            continue;
        }
        // check
        if (suit.suitType == 0) {
            check = TalaGameRule.ktGhepBoCungSo(suit, card);
        } else {
            check = TalaGameRule.ktGhepBoCungChat(suit, card);
        }
        // add to suit
        if (check) {
            if (suit.suitType == 0) {
                suit.cards.push(card);
            } else {
                if (card.id < suit.cards[0].id) {
                    suit.cards.splice(0,0,card);
                } else {
                    suit.cards.push(card);
                }
            }
            // search lai tu dau
            g1.takeCardOut(i);
            i = -1;
        }
    }
}

TalaGameRule.ktGhepBoCungSo = function(suit,cardCheck)
{
    if (suit.cards.length < 3) {
        return false;
    }
    if (suit.cards[0].cardType == cardCheck.cardType) {
        return true;
    }
    return false;
}
TalaGameRule.ktGhepBoCungChat = function(suit,cardCheck)
{
    if (suit.cards.length < 3) {
        return false;
    }
    // cung shape
    if (suit.cards[0].cardShape != cardCheck.cardShape) {
        return false;
    }

    // check lien tiep
    var d1 = suit.cards[0].cardType - cardCheck.cardType;
    var d2 = cardCheck.cardType - suit.cards[suit.cards.length - 1].cardType;
    if ((d1 == 1) || (d2 == 1)) {
        return true;
    }
    return false;
}

TalaGameRule.kiemtraUKhan = function(g1)
{
    var cardTable = TalaGameRule.makeCardTestTable(g1);

    var count = 0;
    for (var i = 0; i < Card.kQuanbai_NONE; i++) {
        count = 0;
        for (var j = 0; j < Card.kChat_NODE; j++) {
            if (cardTable.cards[i][j].id != -1) {
                count++;
                if (count >= 2) {
                    return false;
                }
            }
        }
    }

    for (i = 0; i < Card.kQuanbai_NONE - 2; i++) {
        for (j = 0; j < Card.kChat_NODE; j++) {
            if (cardTable.cards[i][j].id != -1 && cardTable.cards[i + 1][j].id != -1) {
                return false;
            }
            if (cardTable.cards[i][j].id != -1 && cardTable.cards[i + 2][j].id != -1) {
                return false;
            }
            if (cardTable.cards[i + 1][j].id != -1 && cardTable.cards[i + 2][j].id != -1) {
                return false;
            }
        }
    }
    return true;
}



TalaGameRule.copyCardGroup = function(src){
    if(src instanceof  TalaGroupCard)
    {
        return src.clone();
    }
    else if(src  instanceof  PlayerView)
    {
        var dest = new TalaGroupCard([]);
        for(var i=0;i<src._handOnCards.length;i++)
        {
            var card = new Card(src._handOnCards[i].id);
            card.isEaten = src._handOnCards[i].m_IsEaten;
            dest.cards.push(card);
        }
        return dest;
    }
}
TalaGameRule.kiemtraAnQuan = function(g1,cardCheck){
    var group = g1.clone();
    cardCheck.isEaten = true;
    group.putCardIn(cardCheck);
    var allSolution = TalaGameRule.getAllSolution(group);
    if (allSolution.length > 0)
    {
        return true;
    }
    return false;
}

TalaGameRule.getAllSolution = function(g1){
    var retVal = [];
    var allSuit = TalaGameRule.findAllSuit(g1);
    var i, j, k;
    var c1, c2, c3;
    var nEatCard = 0;
    var card = new Card();
    var nullSuit = new TalaSuit();

    // init
    for (i = 0; i < g1.cards.length; i++) {
        card = g1.getCard(i);
        if (card.ID != -1) {
            if (card.isEaten) {
                nEatCard++;
            }
        }
    }
    var isAdd1 = false, isAdd2 = false;
    for (i = 0; i < allSuit.length; i++) {
        isAdd1 = false;
        for (j = i + 1; j < allSuit.length; j++) {
            c1 = TalaGameRule.kiemtraTrungQuan(allSuit[i], allSuit[j]);
            if (c1) {
                isAdd1 = true;
                isAdd2 = false;
                for (k = j + 1; k < allSuit.length; k++) {
                    c2 = TalaGameRule.kiemtraTrungQuan(allSuit[i], allSuit[k]);
                    c3 = TalaGameRule.kiemtraTrungQuan(allSuit[j], allSuit[k]);
                    if (c2 && c3) {
                        if (TalaGameRule.addSolution(retVal, allSuit[i], allSuit[j], allSuit[k], nEatCard)) {
                            isAdd2 = true;
                            return retVal;
                        }
                    }
                }
                if (!isAdd2) {
                    TalaGameRule.addSolution(retVal, allSuit[i], allSuit[j], nullSuit, nEatCard);
                }
            }
        }
        if (!isAdd1) {
            TalaGameRule.addSolution(retVal, allSuit[i], nullSuit, nullSuit, nEatCard);
        }
    }
    return retVal;
}
TalaGameRule.copySuit = function(src){
    return src.clone();
}

TalaGameRule.kiemtraVutQuan = function(group,cardCheck){
    if (cardCheck.isEaten)
    {
        return false;
    }
    var g1 = group.clone();
    var needCheck = false;

    for (var i=0;i<g1.cards.length;i++)
    {
        if (g1.cards[i].isEaten)
        {
            needCheck = true;
            break;
        }
    }
    if (!needCheck)
    {
        return true;
    }
    else
    {
        var g2 = TalaGameRule.copyCardGroup(g1);
        var index = -1;
        for (var i=0;i<g2.cards.length;i++)
        {
            if (g2.getCard(i).id == cardCheck.id)
            {
                index = i;
                break;
            }
        }
        if(index >= 0)
            g2.takeCardOut(index);
        var allSol = TalaGameRule.getAllSolution(g2);
        if (allSol.length > 0)
        {
            return true;
        }
        else
        {
            return false;
        }
    }
}


TalaGameRule.kiemtraHaBai = function(allCards,showCard){
    var allCard = TalaGameRule.copyCardGroup(allCards);

    var kq = new TalaSolution();
    var i,j;

    // pháº£i háº¡ háº¿t nhá»¯ng quÃ¢n bÃ i Ä‘Ã£ Äƒn
    if (showCard.getNumEatCard() != allCard.getNumEatCard()) {
        return kq;
    }
    // kiá»ƒm tra cÃ¡c trÆ°á»�ng há»£p ghÃ©p bÃ i
    var allSol = TalaGameRule.getAllSolution(showCard);
    if (allSol.length <= 0) {
        return kq;
    }
    // náº¿u cÃ³ 3 phá»�m thÃ¬ Ã¹ rá»“i, ko cáº§n xÃ©t ná»¯a
    var g2 = new TalaGroupCard([]);
    for (i = 0; i < allSol.length; i++) {
        if (allSol[i].suit.length >= 3) {
            TalaGameRule.copyDifferent(g2, showCard, allSol[i]);
            if (g2.cards.length > 0) {
                for (j = 0; j < allSol[i].suit.length; j++) {
                    TalaGameRule.addCardsToSuit(allSol[i].suit[j], g2);
                }
            }
            kq = allSol[i];
            return kq;
        }
    }
    // cÃ¡c trÆ°á»�ng há»£p 2 phá»�m
    for (i = 0; i < allSol.length; i++) {
        TalaGameRule.copyDifferent(g2, showCard, allSol[i]);
        if (allSol[i].suit.length == 3) {
            TalaGameRule.addCardsToSuit(allSol[i].suit[0], g2);
            TalaGameRule.addCardsToSuit(allSol[i].suit[1], g2);
            TalaGameRule.addCardsToSuit(allSol[i].suit[2], g2);
        }
        if (allSol[i].suit.length == 2) {
            if (allSol[i].suit[0].suitType == 1) {
                TalaGameRule.addCardsToSuit(allSol[i].suit[0], g2);
                TalaGameRule.addCardsToSuit(allSol[i].suit[1], g2);
            } else {
                TalaGameRule.addCardsToSuit(allSol[i].suit[1], g2);
                TalaGameRule.addCardsToSuit(allSol[i].suit[0], g2);
            }
        }
        if (allSol[i].suit.length == 1) {
            TalaGameRule.addCardsToSuit(allSol[i].suit[0], g2);
        }
        // neu het bai la ok
        if (g2.cards.length <= 0) {
            kq = allSol[i];
            return kq;
        }
    }
    return kq;

}


TalaGameRule.copyDifferent = function(dest,src,sol){
    dest.clearGroup();
    var canAdd = false;
    var card = new Card();
    var suit = new TalaSuit();
    var i, j, k;
    for (i = 0; i < src.cards.length; i++) {
        card = src.getCard(i);
        if (card.id == -1) {
            continue;
        }
        canAdd = true;
        for (j = 0; j < sol.suit.length; j++) {
            if (canAdd) {
                suit = sol.suit[j];
                for (k = 0; k < suit.cards.length; k++) {
                    if (card.id == suit.cards[k].id) {
                        canAdd = false;
                        break;
                    }
                }
            } else {
                break;
            }
        }
        if (canAdd) {
            if (dest.findCard(card.id) == -1){
                dest.putCardIn(card);
            }
        }
    }
    dest.groupType = TalaGroupCard.kType_UNKOWN;
}


TalaGameRule.kiemtraGuiBai = function(sol,cardCheck,solIndex)
{
    if(solIndex === undefined)
    {
        var check = false;
        if (sol.suitType == 0) {
            check = TalaGameRule.ktGhepBoCungSo(sol, cardCheck);

        } else {
            check = TalaGameRule.ktGhepBoCungChat(sol, cardCheck);
        }
        return check;
    }
    else
    {
        var check = false;
        if ((solIndex < 0) || (solIndex >= sol.suit.length)) {
            return false;
        }
        var suit = sol.suit[solIndex];
        if (suit.suitType == 0) {
            check = TalaGameRule.ktGhepBoCungSo(suit, cardCheck);
        } else {
            check = TalaGameRule.ktGhepBoCungChat(suit, cardCheck);
        }
        return check;
    }
}


TalaGameRule.kiemtraMom = function(g1){
    var allSolution = TalaGameRule.getAllSolution(g1);
    if (allSolution.length > 0)
    {
        return false;
    }
    else
    {
        return true;
    }
}


TalaGameRule.tuDongHaBai = function(g1){
    var retVal = new TalaGroupCard([]);
    var sol = new TalaSolution();
    var tg = new TalaSolution();
    var allSol = TalaGameRule.getAllSolution(g1);

    if (allSol.length <= 0) {
        return retVal;
    }

    var i, j, k;
    var suit = new TalaSuit();
    // sap xep cÃ¹ng cháº¥t trÆ°á»›c
    for (i = 0; i < allSol.length; i++) {
        tg = allSol[i];
        for (j = 0; j < tg.suit.length; j++) {
            for (k = j + 1; k < tg.suit.length; k++) {
                if ((tg.suit[j].suitType == 0) && (tg.suit[k].suitType == 1)) {
                    suit = tg.suit[j];
                    tg.suit.splice(j,1);
                    tg.suit.splice(j,0, tg.suit[k - 1]);

                    tg.suit.splice(k,1);
                    tg.suit.splice(k,0, suit);
                }
            }
        }
    }
    // truong hop 2 phom
    var sum = 10000;
    var curSum = 0;;
    var g2 = new TalaGroupCard([]);
    for (i = 0; i < allSol.length; i++) {
        TalaGameRule.copyDifferent(g2, g1, allSol[i]);
        for (j = 0; j < allSol[i].suit.length; j++) {
            TalaGameRule.addCardsToSuit(allSol[i].suit[j], g2);
        }
        // neu ko co bai la` u`
        if (g2.cards.length <= 0) {
            sol = allSol[i];
            break;
        } else {
            curSum = g2.getSum();
            if (curSum < sum) {
                sol = allSol[i];
                sum = curSum;
            }
        }
    }
    // copy data
    if (sol.suit.length > 0) {
        for (i = 0; i < sol.suit.length; i++) {
            suit = sol.suit[i];
            for (j = 0; j < suit.cards.length; j++) {
                retVal.putCardIn(suit.cards[j]);
            }
        }
    }
    return retVal;
}


TalaGameRule.arrangeCard = function(g)
{
    var i = 0, j = 0;
    var card = new Card();;
    var g1 =new TalaGroupCard([]);
    var g2 = new TalaGroupCard([]);
    var g3 = new TalaGroupCard([]);
    var tg = new TalaSolution();
    var suit = new TalaSuit();
    g3 = TalaGameRule.tuDongHaBai(g);
    tg = TalaGameRule.kiemtraHaBai(g, g3);
    if (tg.suit.length > 0) {
        TalaGameRule.copyDifferent(g1, g, tg);
        for (i = 0; i < tg.suit.length; i++) {
            suit = tg.suit[i];
            for (j = 0; j < suit.cards.length; j++) {
                g2.putCardIn(suit.cards[j]);
            }
        }
    } else {
        g1 = TalaGameRule.copyCardGroup(g);
    }
    g3.clearGroup();
    // sap xep lai g1
    var dt = 0;
    var v1 = 0, v2 = 0;
    if (g1.cards.length >= 3) {
        g1.sortCardTypeDown();
        for (i = 0; i < g1.cards.length; i++) {
            card = g1.getCard(i);
            v1 = i - 1;
            v2 = i + 1;
            if (i == 0) {
                v1 = i;
            }
            if (i >= g1.cards.length - 1) {
                v2 = i;
            }
            // kiem tra cung cardType
            if (v1 != i) {
                if (card.getType() == g1.getCard(v1).getType())
                    continue;
                if (card.getShape() == g1.getCard(v1).getShape()) {
                    dt = g1.getCard(v1).getType() - card.getType();
                    if ((dt == 1) || (dt == 2))
                        continue;
                }
            }
            if (v2 != i) {
                if (card.getType() == g1.getCard(v2).getType())
                    continue;
                if (card.getShape() == g1.getCard(v2).getShape()) {
                    dt = card.getType() - g1.getCard(v2).getType();
                    if ((dt == 1) || (dt == 2))
                        continue;
                }
            }
            card = g1.takeCardOut(i);
            g3.putCardIn(card);
            i--;
        }
    }
    // ghep g3 voi g1
    if (g3.cards.length >= 1) {
        g3.sortCardTypeDown();
        for (i = 0; i < g3.cards.length; i++) {
            card = g3.getCard(i);
            v1 = g1.cards.length;
            for (j = 0; j < g1.cards.length; j++) {
                if (g1.getCard(j).getShape() == card.getShape()) {
                    dt = g1.getCard(j).getType() - card.getType();
                    if ((Math.abs(dt) == 1) || (Math.abs(dt) == 2)) {
                        v1 = j + 1;
                        // swap 2 quan neu = nhau
                        if (v1 < g1.cards.length) {
                            if (g1.getCard(v1).getType() == g1.getCard(j).getType()) {
                                g1.swap2Card(j, j + 1);
                                v1 = j + 2;
                            }
                        }
                        break;
                    }
                }
            }
            card = g3.takeCardOut(i);
            g1.insertCard(card, v1);
            i--;
        }
    }

    // ghep g2 voi g1
    for (i = 0; i < g1.cards.length; i++) {
        g2.putCardIn(g1.getCard(i));
    }

    // ghep g2 voi g3
    for (i = 0; i < g3.cards.length; i++) {
        g2.putCardIn(g3.getCard(i));
    }
    // update player hand cards
    g.clearGroup();
    g = TalaGameRule.copyCardGroup(g2);
    return g2;
}