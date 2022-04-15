/**
 * Created by sonbnt on 03/12/2021
 */

var TalaRule = cc.Class.extend({});

TalaRule.findAllSuit = function(group){

}

TalaRule.canSendCard = function(suitIds, cardId){
    var suit = new TalaSuit(suitIds);
    return suit.checkCard(new Card(cardId));
}