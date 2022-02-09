/**
 * Created by HOANG on 8/17/2015.
 */


var GameHelper = function(){}

var kSort_TangDan = 0;
var kSort_Group = 1;
var kSort_Unknown = 2;


GameHelper.kiemtraDanh = function(group){
    if(group._typeGroup != GroupCard.kType_BAIRAC)
        return true;
    if((group._typeGroup == GroupCard.kType_BAIRAC) && (group._cards.length == 1))
        return true;
    return false;
}


GameHelper.recommend = function(cards,cardHandon,cardselect){               // Tim` bo bai` hop ly (chua card select) tu bo bai tren tay co the chat duoc cards
    var cards_ = [];
    for(var i=0;i<cards.length;i++)
    {
        cards_.push(new Card(cards[i]));
    }
    var group = new GroupCard(cards_);
    var recommend = [];
    recommend.push(cardselect);
    switch (group._typeGroup)
    {
        case GroupCard.kType_BAIRAC:
        {
            if((cards.length == 1) && (Math.floor(cards[0]/4) == Card.kQuanbai_2))
            {
                // Tim cac la co cung` quan bai voi cardselect , (chek xem co tu quy nao khong)
                var quanbai_ = [];
                for(var i=0;i<cardHandon.length;i++)
                {
                    if(Math.floor(cardselect / 4) == Math.floor(cardHandon[i] / 4))
                    {
                        quanbai_.push(cardHandon[i]);
                    }
                }
                if(quanbai_.length == 4)
                {
                    for(var i=0;i<4;i++)
                    {
                        if(quanbai_[i] != cardselect)
                            recommend.push(quanbai_[i])
                    }
                }
            }
            break;
        }
        case GroupCard.kType_DOI:
        case GroupCard.kType_BALA:
        case GroupCard.kType_TUQUY:
        {
            // Tim cac la co cung` quan bai voi cardselect
            var quanbai_ = [];
            for(var i=0;i<cardHandon.length;i++)
            {
                if(Math.floor(cardselect / 4) == Math.floor(cardHandon[i] / 4))
                {
                    quanbai_.push(cardHandon[i]);
                }
            }
            quanbai_.sort(function(a,b){return a > b;});
            cc.log("GAME HELP RECOMMENDED BO", JSON.stringify(quanbai_));
            var idx = 0;
            for(var i=0;i<quanbai_.length;i++)
            {
                if(quanbai_[i] == cardselect)
                {
                    idx = i;
                    break;
                }
            }
            if(group._typeGroup == GroupCard.kType_DOI)
            {
                if(quanbai_.length < 2)           // Neu so quan bai giong cardselect nho hon 2 hoac quan bai`nay` nho hon cards can` chat.
                    break;
                if(group._cards[0]._quanbai == Card.kQuanbai_2)    // cards la` doi 2 (truong hop dac biet)  -> can` check co doi tu quy khong
                {
                    var doituquy = timdoituquychat2(cards,cardHandon,cardselect);

                    for(var i=0;i<doituquy.length;i++)
                    {
                        recommend.push(doituquy[i]);
                    }
                    break;
                }
                if(Math.floor(quanbai_[0]/4)  == Card.kQuanbai_2)
                {
                    recommend.push(quanbai_[(idx +1)>=quanbai_.length?idx+1-quanbai_.length:idx+1]);
                    break;
                }
                if(group._cards[0]._quanbai >= Math.floor(quanbai_[0]/4))
                    break;
                // Neu chat duoc -> push nhung card con lai
                recommend.push(quanbai_[(idx +1)>=quanbai_.length?idx+1-quanbai_.length:idx+1]);
            }
            else if(group._typeGroup == GroupCard.kType_BALA)
            {
                if(group._cards[0]._quanbai == Card.kQuanbai_2)
                    break;
                if(quanbai_.length < 3)
                    break;
                if(Math.floor(quanbai_[0]/4)  == Card.kQuanbai_2)
                {
                    recommend.push(quanbai_[(idx +1)>=quanbai_.length?idx+1-quanbai_.length:idx+1]);
                    recommend.push(quanbai_[(idx +2)>=quanbai_.length?idx+2-quanbai_.length:idx+2]);
                    break;
                }
                if(group._cards[0]._quanbai >= Math.floor(quanbai_[0]/4))
                    break;
                recommend.push(quanbai_[(idx +1)>=quanbai_.length?idx+1-quanbai_.length:idx+1]);
                recommend.push(quanbai_[(idx +2)>=quanbai_.length?idx+2-quanbai_.length:idx+2]);
            }
            else if(group._typeGroup == GroupCard.kType_TUQUY)
            {
                if(group._cards[0]._quanbai == Card.kQuanbai_2)
                    break;
                if(quanbai_.length < 4)
                    break;
                if(Math.floor(quanbai_[0]/4)  == Card.kQuanbai_2)
                {
                    recommend.push(quanbai_[(idx +1)>=quanbai_.length?idx+1-quanbai_.length:idx+1]);
                    recommend.push(quanbai_[(idx +2)>=quanbai_.length?idx+2-quanbai_.length:idx+2]);
                    recommend.push(quanbai_[(idx +3)>=quanbai_.length?idx+3-quanbai_.length:idx+3]);
                    break;
                }
                if(group._cards[0]._quanbai >= Math.floor(quanbai_[0]/4))
                    break;
                recommend.push(quanbai_[(idx +1)>=quanbai_.length?idx+1-quanbai_.length:idx+1]);
                recommend.push(quanbai_[(idx +2)>=quanbai_.length?idx+2-quanbai_.length:idx+2]);
                recommend.push(quanbai_[(idx +3)>=quanbai_.length?idx+3-quanbai_.length:idx+3]);
            }

            break;
        }
        case GroupCard.kType_SANHDOC:
        {
            recommend = timsanhdocchatduoc(cards,cardHandon,cardselect);
            break;
        }
        case GroupCard.kType_DOITUQUY:
        {
            recommend = timdoituquychatdoituquy(cards,cardHandon,cardselect);
            break;
        }
    }

    return recommend;

}


GameHelper.kiemtraChatQuan = function(a,b)
{
    if (a._typeGroup != b._typeGroup)
    {
        // Nhung TH dac biet khac loai nhom bai ma co the chat duoc
        if ((a._typeGroup == GroupCard.kType_BAIRAC) && (a._cards.length == 1) && (a._cards[0]._quanbai == Card.kQuanbai_2) && (b._typeGroup == GroupCard.kType_TUQUY))
        {
            return true;
        }
        else if((a._typeGroup == GroupCard.kType_DOI) && (a._cards[0]._quanbai == Card.kQuanbai_2) && (b._typeGroup == GroupCard.kType_DOITUQUY))
        {
            return true;
        }
        return false;
    }
    switch (a._typeGroup)
    {
        case GroupCard.kType_BAIRAC:
            if ((a._cards.length != 1) || (b._cards.length != 1) || (a._cards[0]._quanbai == Card.kQuanbai_2))
            {
                return false;
            }
            else if((a._cards[0]._quanbai < b._cards[0]._quanbai) || (b._cards[0]._quanbai == Card.kQuanbai_2))
            {
                return true;
            }
            else
            {
                return false;
            }
            break;
        case GroupCard.kType_DOI:
        case GroupCard.kType_BALA:
            if (a._cards[0]._quanbai == Card.kQuanbai_2)
            {
                return false;
            }
            else if((a._cards[0]._quanbai < b._cards[0]._quanbai) || (b._cards[0]._quanbai == Card.kQuanbai_2))
            {
                return true;
            }
            else
            {
                return false;
            }
            break;
        case GroupCard.kType_SANHDOC:
        {
            if ((a._cards.length != b._cards.length) || (a._cards[a._cards.length-1]._quanbai >= b._cards[b._cards.length-1]._quanbai))
            {
                return false;
            }
            else
            {
                return true;
            }
            break;
        }
        case GroupCard.kType_TUQUY:
        {
            if ((a._cards[0]._quanbai < b._cards[0]._quanbai) || (b._cards[0]._quanbai == Card.kQuanbai_2))
            {
                return true;
            }
            else
            {
                return false;
            }
            break;
        }
        case GroupCard.kType_DOITUQUY:
        {
            a._cards.sort(function(a, b){return a._id- b._id});
            b._cards.sort(function(a, b){return a._id- b._id});
            var tuquy1a = a._cards[0]._quanbai;
            var tuquy2a = a._cards[a._cards.length-1]._quanbai;

            var tuquy1b= b._cards[0]._quanbai;
            var tuquy2b = b._cards[b._cards.length-1]._quanbai;

            if(((tuquy1b > tuquy1a) && (tuquy2b > tuquy2a)) || ((tuquy1b > tuquy2a) && (tuquy2b > tuquy1a)))
                return true;
            return false;

            break;
        }
        default:
            return false;
            break;
    }
}

GameHelper.sapxepQuanBai = function(card, sort) {
    if (sort === kSort_TangDan) {
        cc.log("SORT Tang dan");
        card.sort(function(a, b) {
            var valueA = (a._quanbai + 11) % 14;
            var valueB = (b._quanbai + 11) % 14;
            return valueA - valueB;
        });
        return card;
    }

    if (sort === kSort_Group) {
        var cards = [];
        var _tmp = card.slice();
        _tmp.sort(function(a, b) {
            var valueA = (a._quanbai + 11) % 14;
            var valueB = (b._quanbai + 11) % 14;
            return valueB - valueA;
        });
        cc.log("SORT Group", JSON.stringify(_tmp));

        var size = _tmp.length - 1;
        var count = 0;
        //check FourOfAKind
        if (size + 1 >= 4) {
            count = 0;
            while (size > 0) {
                if (_tmp[size]._quanbai === _tmp[size - 1]._quanbai) {
                    count++;
                    if (count === 3) {
                        //FourOfAKind(size - 1) -> (size + 2)
                        cards.push(_tmp[size - 1]);
                        cards.push(_tmp[size]);
                        cards.push(_tmp[size + 1]);
                        cards.push(_tmp[size + 2]);
                        _tmp.splice(size - 1, 4);
                        size -= 2;
                        count = 0;
                    } else {
                        size--;
                    }
                } else {
                    count = 0;
                    size--;
                }
            }
        }

        if (_tmp.length >= 3) {
            // Check Straight
            _tmp.sort(function(a, b) {
                return a._quanbai - b._quanbai;
            });
            while (true) {
                // Loai bo cac quan bai bang nhau khac chat (de xet cac sanh) , no bao gom chi so cua cac quan bai trong vector tmp
                var idx = [0];
                for (var i = 1; i < _tmp.length; i++) {
                    if (_tmp[i]._quanbai > _tmp[i - 1]._quanbai) {
                        idx.push(i);
                    }
                }
                if (idx.length < 3) {
                    break;
                }

                var sanhIdxs = [];				// Chi so cac quan bai tao sanh doc trong vector tmp
                var cosanhdoc = false;
                var iter = idx.length - 1;
                while (iter > 0) {
                    var end = false;
                    if (_tmp[idx[iter]]._quanbai === (_tmp[idx[iter - 1]]._quanbai + 1)) {
                        if (sanhIdxs.length === 0) {
                            sanhIdxs.push(idx[iter]);
                        }
                        sanhIdxs.push(idx[iter-1]);
                        if (iter === 1) {
                            end = true;
                        }
                    }

                    if(_tmp[idx[iter]]._quanbai !== (_tmp[idx[iter - 1]]._quanbai + 1) || end) {
                        if (sanhIdxs.length >= 3) {
                            for (var j = sanhIdxs.length - 1; j >= 0; j--) {
                                cards.push(_tmp[sanhIdxs[j]]);
                            }
                            cosanhdoc = true;
                            for (var j = 0; j < sanhIdxs.length; j++) {
                                _tmp.splice(sanhIdxs[j], 1);
                            }
                            sanhIdxs = [];
                            break;
                        }
                        sanhIdxs = [];
                    }
                    iter--;
                }

                if (!cosanhdoc) {
                    break;
                }
            }

            cc.log("SORTING ThreeOfAKind", _tmp.length, JSON.stringify(_tmp));
            _tmp.sort(function(a, b) {
                var valueA = (a._quanbai + 11) % 14;
                var valueB = (b._quanbai + 11) % 14;
                return valueB - valueA;
            });
            cc.log("SORTING ThreeOfAKind", _tmp.length, JSON.stringify(_tmp));
            //check ThreeOfAKind
            size = _tmp.length - 1;
            if (size + 1 >= 3) {
                count = 0;
                while (size > 0) {
                    if (_tmp[size]._quanbai === _tmp[size - 1]._quanbai) {
                        count++;
                        if (count === 2) {
                            //FourOfAKind(size - 1) -> (size + 1)
                            cards.push(_tmp[size - 1]);
                            cards.push(_tmp[size]);
                            cards.push(_tmp[size + 1]);
                            _tmp.splice(size - 1, 3);
                            size -= 2;
                            count = 0;
                        } else {
                            size--;
                        }
                    } else {
                        count = 0;
                        size--;
                    }
                }
            }
        }

        //check Pair
        cc.log("SORTING PAIR", _tmp.length, JSON.stringify(_tmp));
        if (_tmp.length >= 2) {
            size = _tmp.length - 1;
            while (size > 0) {
                cc.log("SORTING", size, _tmp[size]._quanbai);
                if (_tmp[size]._quanbai === _tmp[size - 1]._quanbai) {
                    //Pair (size - 1) -> (size)
                    cards.push(_tmp[size - 1]);
                    cards.push(_tmp[size]);
                    _tmp.splice(size - 1, 2);
                    size -= 2;
                } else {
                    size--;
                }
            }
        }

        //Leftover trash cards
        _tmp.sort(function(a, b) {
            var valueA = (a._quanbai + 11) % 14;
            var valueB = (b._quanbai + 11) % 14;
            return valueA - valueB;
        });
        for (var i = 0; i < _tmp.length; i++) {
            cards.push(_tmp[i]);
        }

    }
    return cards;
}

GameHelper.kiemtraThoiHeo = function(cards)
{
    var count = 0;
    for(var i=0;i<cards.length;i++)
    {
        if(Math.floor(cards[i] / 4) == Card.kQuanbai_2)
        {
            count ++;
        }
    }
    return count > 0;
}

GameHelper.checkAPig = function(cards)
{
    return cards.length === 1 && GameHelper.kiemtraThoiHeo(cards);
}

GameHelper.kiemtraThoiTuQuy = function(cards)
{
    cards.sort(function(a, b){return a- b});

    if (cards.length >= 4)
    {
        // check tu quy
        var size = cards.length-1;
        var count = 0;
        while (size > 0)
        {
            if (Math.floor(cards[size]/4) == Math.floor(cards[size-1]/4))
            {
                count++;
                if (count == 3)		// co tu quy tu` (size-1) -> size + 2
                {
                    return true;
                }
                else
                {
                    size--;
                }
            }
            else

            {
                count = 0;
                size--;
            }

        }
        return false;
    }
    else
        return false;
}

GameHelper.checkFourOfAKind = function(cards)
{
    return cards.length === 4 && GameHelper.kiemtraThoiTuQuy(cards);
}


var timsanhdocchatduoc = function(cards,handOn,select)
{
    cards.sort(function(a, b){return a- b});
    if((Math.floor(cards[cards.length - 1] / 4) == Card.kQuanbai_A)  && (Math.floor(cards[0] / 4) == Card.kQuanbai_2) )       // truong hop no la sanh tu` A thi` dao A len dau tien
    {
        var a = cards[cards.length - 1];cards.pop();
        cards.splice(0,0,a);
    }
    handOn.sort(function(a, b){return a- b});
    var ret = [];                               // chua cac id card phu hop
    ret.push(select);

    var cardLoaibo = [];     //Loai bo cac quan bai bang nhau khac chat
    var indexSelect = 0;
    cardLoaibo.push(handOn[0]);
    for (var i = 1;i<handOn.length;i++)
    {
        if (Math.floor(handOn[i]/4) > Math.floor(handOn[i-1]/4))
        {
            cardLoaibo.push(handOn[i]);
        }
    }
    for(var i=0;i<cardLoaibo.length;i++)
    {
        if(Math.floor(cardLoaibo[i]/4) == Math.floor(select/4))
        {
            indexSelect = i;
            break;
        }
    }

    // tim sanh chua card select dai` nhat co the
    var cardSanhDaiNhat = [];
    cardSanhDaiNhat.push(cardLoaibo[indexSelect]);
    var count = indexSelect;
    while(count > 0)
    {
        if(Math.floor(cardLoaibo[count]/4) == (Math.floor(cardLoaibo[count-1]/4) + 1) )
        {
            cardSanhDaiNhat.push(cardLoaibo[count-1]);
            count--;
        }
        else
        {
            break;
        }
    }
    count = indexSelect;
    while(count < (cardLoaibo.length-1))
    {
        if(Math.floor(cardLoaibo[count]/4) == (Math.floor(cardLoaibo[count+1]/4) - 1) )
        {
            cardSanhDaiNhat.push(cardLoaibo[count+1]);
            count++;
        }
        else
        {
            break;
        }
    }

    cardSanhDaiNhat.sort(function(a, b){return a- b});
    //kiem tra dieu kien can` de cardSanhDaiNhat chat dc cards
    if(cardSanhDaiNhat.length < cards.length)
        return ret;
    if((Math.floor(cardSanhDaiNhat[cardSanhDaiNhat.length -1]/4) <= Math.floor(cards[cards.length-1]/4)))
        return ret;

    //  Tim Sanh do dai bang card va chat dc no
    for(var i=0;i<cardSanhDaiNhat.length;i++)
    {
        if(Math.floor(cardSanhDaiNhat[i]/4) == Math.floor(select/4))
        {
            indexSelect = i;            // indexSelect khi nay la vi tri cua selectcard trong cardSanhDaiNhat
            break;
        }
    }

    for(var i=0;i<cards.length;i++) {
        var idxMin = (indexSelect - (cards.length-1) + i);
        var idxMax = idxMin + cards.length - 1;
        if((idxMin < 0) || (idxMax >= cardSanhDaiNhat.length))
            continue;
        if(Math.floor(cardSanhDaiNhat[idxMax]/4) > Math.floor(cards[cards.length-1]/4))
        {
            for(var j=idxMin;j<= idxMax;j++)
            {
                if(Math.floor(cardSanhDaiNhat[j]/4) != Math.floor(select/4))
                {
                    ret.push(cardSanhDaiNhat[j]);
                }
            }
            break;
        }
    }


    return ret;
}

var timdoituquychat2 = function(cards,cardHandon,cardselect)
{
    var tmp = [];
    var ret = [];
    for(var i=0;i<cardHandon.length;i++)
    {
        tmp.push(cardHandon[i]);
    }
    tmp.sort(function(a, b){return a- b});

    for(var i=0;i<cardHandon.length;i++)
    {
        if(Math.floor(cardselect / 4) == Math.floor(cardHandon[i] / 4))
        {
            ret.push(cardHandon[i]);
        }
    }
    if(ret.length != 4)
    {
        return [];
    }
    else
    {
        ret.sort(function(a, b){return a- b});
        var idx = 0;
        for(var i=0;i<tmp.length;i++)
        {
            if(ret[0] == tmp[i])
            {
                idx = i;
                break;
            }
        }
        tmp.splice(idx,4);
        if (tmp.length >= 4)
        {
            // check tu quy
            var size = tmp.length-1;
            var count = 0;
            var cotuquy = false;
            while (size > 0)
            {
                if (Math.floor(tmp[size]/4) == Math.floor(tmp[size-1]/4))
                {
                    count++;
                    if (count == 3)		// co tu quy tu` (size-1) -> size + 2
                    {
                        ret.push(tmp[size-1]);ret.push(tmp[size]);ret.push(tmp[size+1]);ret.push(tmp[size+2]);
                        size-=4;
                        count =0;
                        cotuquy = true;
                        //cc.log("ret "+ret.length);
                        return ret;
                    }
                    else
                    {
                        size--;
                    }
                }
                else
                {
                    count = 0;
                    size--;
                }

            }
            if(!cotuquy)
            {
                return [];
            }
        }
        else
        {
            return [];
        }

    }

}

var timdoituquychatdoituquy = function(cards,cardHandon,cardselect)
{
    cards.sort(function(a, b){return a- b});
    var tuquy1 = Math.floor(cards[0] / 4);
    var tuquy2 = Math.floor(cards[cards.length-1] / 4);

    var tmp = [];
    var retTuquy01 = [];

    for(var i=0;i<cardHandon.length;i++)
    {
        tmp.push(cardHandon[i]);
    }
    tmp.sort(function(a, b){return a- b});

    for(var i=0;i<cardHandon.length;i++)
    {
        if(Math.floor(cardselect / 4) == Math.floor(cardHandon[i] / 4))
        {
            retTuquy01.push(cardHandon[i]);
        }
    }
    if(retTuquy01.length != 4)
    {
        return [];
    }
    else
    {
        retTuquy01.sort(function(a, b){return a- b});
        var idx = 0;
        for(var i=0;i<tmp.length;i++)
        {
            if(retTuquy01[0] == tmp[i])
            {
                idx = i;
                break;
            }
        }
        tmp.splice(idx,4);
        if (tmp.length >= 4)
        {
            // check tu quy
            var size = tmp.length-1;
            var count = 0;
            var cotuquy = false;
            while (size > 0)
            {
                if (Math.floor(tmp[size]/4) == Math.floor(tmp[size-1]/4))
                {
                    count++;
                    if (count == 3)		// co tu quy tu` (size-1) -> size + 2
                    {
                        var retTuquy02 = [];
                        retTuquy02.push(tmp[size-1]);retTuquy02.push(tmp[size]);retTuquy02.push(tmp[size+1]);retTuquy02.push(tmp[size+2]);
                        //size-=4;
                        //count =0;
                        //cotuquy = true;

                        // den day ta co 2 tu quy tu` card handon , check xem chung co the chat dc ko
                        var check1 = Math.floor(retTuquy01[0]/4);
                        var check2 = Math.floor(retTuquy02[0]/4);

                        if(((check1 > tuquy1) && (check2 > tuquy2)) || ((check1 > tuquy2) && (check2 > tuquy1)))
                        {
                            var ret = [];
                            for(var i=0;i<4;i++)
                            {
                                ret.push(retTuquy01[i]);
                                ret.push(retTuquy02[i]);
                            }
                            return ret;
                        }
                        else
                        {
                            return [];
                        }
                    }
                    else
                    {
                        size--;
                    }
                }
                else
                {
                    count = 0;
                    size--;
                }

            }
            if(!cotuquy)
            {
                return [];
            }
        }
        else
        {
            return [];
        }

    }
}

// Kiem tra bo luot
GameHelper.kiemtraChatduockhong = function(a,b)  // kiem tra trong bo bai` b co the chat dc a khong (a la group)  true: khong phai bo luot , false : bo luot
{
    switch(a._typeGroup)
    {
        case GroupCard.kType_BAIRAC:
        {
            if(a._cards[0]._quanbai == Card.kQuanbai_2)         // kiem tra xem co tu quy de chat khong
            {
                var _tmp = b._cards.slice();
                _tmp.sort(function(a, b){return a._id- b._id});
                if (_tmp.length >= 4)
                {
                    // check tu quy
                    var size = _tmp.length-1;
                    var count = 0;
                    while (size > 0)
                    {
                        if (_tmp[size]._quanbai == _tmp[size-1]._quanbai)
                        {
                            count++;
                            if (count == 3)		// co tu quy tu` (size-1) -> size + 2
                            {
                                return true;
                            }
                            else
                            {
                                size--;
                            }
                        }
                        else
                        {
                            count = 0;
                            size--;
                        }

                    }
                    return false;
                }
                else
                {
                    return false;
                }

            }
            else
            {
                var cothechat = false;
                for(var i=0;i< b._cards.length;i++)
                {
                    if(b._cards[i]._quanbai > a._cards[0]._quanbai || b._cards[i]._quanbai == Card.kQuanbai_2)
                    {
                        cothechat = true;
                        break;
                    }
                }
                return cothechat;
            }
            break;
        }
        case GroupCard.kType_DOI:
        {
            if(a._cards[0]._quanbai == Card.kQuanbai_2)         // kiem tra xem co doi tu quy khong
            {
                var _tmp = b._cards.slice();
                _tmp.sort(function(a, b){return a._id- b._id});
                if (_tmp.length >= 8) {
                    // check tu quy
                    var size = _tmp.length - 1;
                    var count = 0;
                    var sotuquy = 0;
                    while (size > 0) {
                        if (_tmp[size]._quanbai == _tmp[size - 1]._quanbai) {
                            count++;
                            if (count == 3)		// co tu quy tu` (size-1) -> size + 2
                            {
                                sotuquy++;
                                if (sotuquy == 2)
                                    return true;
                                //_tmp.splice(size - 1, 4);
                                size--;
                                count = 0;
                            }
                            else {
                                size--;
                            }
                        }
                        else {
                            count = 0;
                            size--;
                        }

                    }
                    return false;
                }
                else
                    return false;
            }
            else
            {
                var _tmp = b._cards.slice();
                _tmp.sort(function(a, b){return a._id- b._id});
                if (_tmp.length >= 2)
                {
                    // Check doi
                    var size_ = _tmp.length-1;
                    var count = 0;
                    while (size_ > 0)
                    {
                        if (_tmp[size_]._quanbai == _tmp[size_-1]._quanbai)
                        {
                            count++;
                            if (count == 1)		// co doi tu` (size-1) -> size
                            {
                                if((_tmp[size_-1]._quanbai > a._cards[0]._quanbai) || (_tmp[size_-1]._quanbai == Card.kQuanbai_2) )
                                    return true;
                                _tmp.splice(size_-1,2);
                                size_ -= 2;
                                count = 0;

                            }
                            else
                            {
                                size_--;
                            }
                        }
                        else
                        {
                            count = 0;
                            size_--;
                        }
                    }
                    return false;
                }
                else
                {
                    return false;
                }
            }
            break;
        }
        case GroupCard.kType_BALA:
        {
            if(a._cards[0]._quanbai == Card.kQuanbai_2)
            {
                return false;
            }
            else
            {
                var _tmp = b._cards.slice();
                _tmp.sort(function(a, b){return a._id- b._id});
                if (_tmp.length >= 3)
                {
                    // Check ba la
                    var size = _tmp.length-1;
                    var count = 0;
                    while (size > 0)
                    {
                        if (_tmp[size]._quanbai == _tmp[size-1]._quanbai)
                        {
                            count++;
                            if (count == 2)		// co bala tu` (size-1) -> size + 1
                            {
                                if((_tmp[size-1]._quanbai > a._cards[0]._quanbai) || (_tmp[size-1]._quanbai == Card.kQuanbai_2) )
                                    return true;
                                _tmp.splice(size-1,3);
                                size -= 3;
                                count = 0;

                            }
                            else
                            {
                                size--;
                            }
                        }
                        else
                        {
                            count = 0;
                            size--;
                        }

                    }
                    return false;
                }
                else
                {
                    return false;
                }
            }

            break;
        }
        case GroupCard.kType_TUQUY:
        {
            var _tmp = b._cards.slice();
            _tmp.sort(function(a, b){return a._id- b._id});
            if (_tmp.length >= 4)
            {
                // check tu quy
                var size = _tmp.length-1;
                var count = 0;
                while (size > 0)
                {
                    if (_tmp[size]._quanbai == _tmp[size-1]._quanbai)
                    {
                        count++;
                        if (count == 3)		// co tu quy tu` (size-1) -> size + 2
                        {
                            if(_tmp[size-1]._quanbai > a._cards[0]._quanbai || _tmp[size-1]._quanbai == Card.kQuanbai_2)
                                return true;
                            //_tmp.splice(size-1,4);
                            size--;
                            count =0;
                        }
                        else
                        {
                            size--;
                        }
                    }
                    else
                    {
                        count = 0;
                        size--;
                    }

                }
                return false;
            }
            else
            {
                return false;
            }
            break;
        }
        case GroupCard.kType_DOITUQUY:
        {
            a._cards.sort(function(a, b){return a._id- b._id});
            var tuquy1a = a._cards[0]._quanbai;
            var tuquy2a = a._cards[a._cards.length-1]._quanbai;
            var tuquy1b = -1;
            var tuquy2b = -1;

            var _tmp = b._cards.slice();
            _tmp.sort(function(a, b){return a._id- b._id});


            if (_tmp.length >= 8)
            {
                // check tu quy
                var size = _tmp.length-1;
                var count = 0;
                var sotuquy = 0;
                while (size > 0)
                {
                    if (_tmp[size]._quanbai == _tmp[size-1]._quanbai)
                    {
                        count++;
                        if (count == 3)		// co tu quy tu` (size-1) -> size + 2
                        {
                            sotuquy++;
                            if(sotuquy == 1)
                            {
                                tuquy1b = _tmp[size-1]._quanbai;
                            }
                            else if(sotuquy == 2)
                            {
                                tuquy2b = _tmp[size-1]._quanbai;
                                if(((tuquy1b > tuquy1a) && (tuquy2b > tuquy2a)) || ((tuquy1b > tuquy2a) && (tuquy2b > tuquy1a)))
                                    return true;
                            }

                            _tmp.splice(size-1,4);
                            size-=4;
                            count =0;
                        }
                        else
                        {
                            size--;
                        }
                    }
                    else
                    {
                        count = 0;
                        size--;
                    }

                }
                return false;
            }
            else
            {
                return false;
            }
            break;
        }
        case GroupCard.kType_SANHDOC:
        {
            a._cards.sort(function(a, b){return a._id- b._id});
            var _tmp = b._cards.slice();
            _tmp.sort(function(a, b){return a._id- b._id});

            if (_tmp.length >= 3) {
                // Check sanh doc
                while (true) {
                    var cards = [];         // chua sanh neu co
                    var idx = [];					// Loai bo cac quan bai bang nhau khac chat (de xet cac sanh) , no bao gom chi so cua cac quan bai trong vector tmp
                    idx.push(0);
                    for (var i = 1; i < _tmp.length; i++) {
                        if (_tmp[i]._quanbai > _tmp[i - 1]._quanbai) {
                            idx.push(i);
                        }
                    }
                    if (idx.length < 3) {
                        return false;
                    }
                    var sanhIdxs = [];				// Chi so cac quan bai tao sanh doc trong vector tmp
                    var cosanhdoc = false;
                    var iter = idx.length - 1;
                    while (iter > 0) {
                        var end = false;
                        if (_tmp[idx[iter]]._quanbai == (_tmp[idx[iter - 1]]._quanbai + 1)) {
                            if (sanhIdxs.length == 0) {
                                sanhIdxs.push(idx[iter]);
                            }
                            sanhIdxs.push(idx[iter - 1]);
                            if (iter == 1) {
                                end = true;
                            }
                        }
                        if (_tmp[idx[iter]]._quanbai != (_tmp[idx[iter - 1]]._quanbai + 1) || end) {
                            if (sanhIdxs.length >= 3) {
                                for (var j = sanhIdxs.length - 1; j >= 0; j--) {
                                    cards.push(_tmp[sanhIdxs[j]]);
                                }
                                cosanhdoc = true;
                                for (var j = 0; j < sanhIdxs.length; j++) {
                                    _tmp.splice(sanhIdxs[j], 1);
                                }
                                sanhIdxs = [];

                                break;
                            }
                            sanhIdxs = [];
                        }
                        iter--;
                    }
                    if (!cosanhdoc) {
                        break;
                    }
                    else
                    {
                        cards.sort(function(a, b){return a._id- b._id});
                        if((a._cards[a._cards.length - 1]._quanbai == Card.kQuanbai_A) && (a._cards[0]._quanbai == Card.kQuanbai_2))    // a la sanh tu A
                        {
                            if(cards.length >= a._cards.length && cards[cards.length-1]._quanbai > a._cards[a._cards.length - 2]._quanbai)
                                return true;
                        }
                        if(cards.length >= a._cards.length && cards[cards.length-1]._quanbai > a._cards[a._cards.length - 1]._quanbai)
                            return true;
                    }
                }
                return false;
            }
            else
                return false;
            break;
        }
    }

}

// Kiem banCard
GameHelper.checkBanCards = function(a, b)  //check if the cards is playable
{
    var playable = [];
    var length = 0;
    b = b._cards.slice();
    b.sort(function(a, b) {
        if (Math.floor(a._id / 4) === 2) return 1;
        if (Math.floor(b._id / 4) === 2) return -1;
        return a._id - b._id;
    });
    var typeGroup = a._typeGroup;
    a = a._cards.slice();
    a.sort(function(a, b) {
        if (Math.floor(a._id / 4) === 2) return 1;
        if (Math.floor(b._id / 4) === 2) return -1;
        return a._id - b._id;
    });
    cc.log("checkBanCards", JSON.stringify(b),  JSON.stringify(a), typeGroup);

    switch (typeGroup) {
        case GroupCard.kType_BAIRAC:
            // kiem tra xem co tu quy de chat khong
            if (a[0]._quanbai === Card.kQuanbai_2) {
                length = 4;
                if (b.length >= length) {
                    // check tu quy
                    for (var i = 0; i < b.length - (length - 1); i++)
                        if (b[i]._quanbai === b[i + (length - 1)]._quanbai) {
                            for (var j = 0; j < length; j++)
                                playable.push(b[i + j]._id);
                            i = i + (length - 1);
                        }
                }
            } else {
                for (var i = 0; i < b.length; i++) {
                    if (b[i]._quanbai > a[0]._quanbai || b[i]._quanbai === Card.kQuanbai_2) {
                        playable.push(b[i]._id);
                    }
                }
            }
            break;
        case GroupCard.kType_DOI:
            if (a[0]._quanbai === Card.kQuanbai_2) {
                // kiem tra xem co doi tu quy khong
                length = 8;
                if (b.length >= length) {
                    // get all tu quy
                    var lengthSub = 4;
                    var subArray = [];
                    for (var i = 0; i < b.length - (lengthSub - 1); i++)
                        if (b[i]._quanbai === b[i + (lengthSub - 1)]._quanbai) {
                            for (var j = 0; j < lengthSub; j++)
                                subArray.push(b[i + j]);
                            i = i + (lengthSub - 1);
                        }
                    if (subArray.length >= length)
                        for (var i = 0; i < subArray.length; i++) {
                            playable.push(subArray[i]._id);
                        }
                }
            } else {
                length = 2;
                if (b.length >= length) {
                    for (var i = 0; i < b.length - (length - 1); i++)
                        if (b[i]._quanbai === b[i + (length - 1)]._quanbai &&
                            (b[i]._quanbai === Card.kQuanbai_2 || b[i]._quanbai > a[0]._quanbai)) {
                            for (var j = 0; j < length; j++)
                                playable.push(b[i + j]._id);
                            i = i + (length - 1);
                        }
                }
            }
            break;
        case GroupCard.kType_BALA:
            if (a[0]._quanbai !== Card.kQuanbai_2) {
                length = 3;
                if (b.length >= length) {
                    for (var i = 0; i < b.length - (length - 1); i++)
                        if (b[i]._quanbai === b[i + (length - 1)]._quanbai &&
                            (b[i]._quanbai === Card.kQuanbai_2 || b[i]._quanbai > a[0]._quanbai)) {
                            for (var j = 0; j < length; j++)
                                playable.push(b[i + j]._id);
                            i = i + (length - 1);
                        }
                }
            }
            break;
        case GroupCard.kType_TUQUY:
            if (a[0]._quanbai !== Card.kQuanbai_2) {
                length = 4;
                if (b.length >= length) {
                    // Check Tu quy
                    for (var i = 0; i < b.length - (length - 1); i++)
                        if (b[i]._quanbai === b[i + (length - 1)]._quanbai &&
                            (b[i]._quanbai === Card.kQuanbai_2 || b[i]._quanbai > a[0]._quanbai)) {
                            for (var j = 0; j < length; j++)
                                playable.push(b[i + j]._id);
                            i = i + (length - 1);
                        }
                }
            }
            break;
        case GroupCard.kType_DOITUQUY:
            if (a[0]._quanbai !== Card.kQuanbai_2) {
                // kiem tra xem co doi tu quy khong
                length = 8;
                if (b.length >= length) {
                    // get all tu quy
                    var lengthSub = 4;
                    var subArray = [];
                    for (var i = 0; i < b.length - (lengthSub - 1); i++)
                        if (b[i]._quanbai === b[i + (lengthSub - 1)]._quanbai) {
                            for (var j = 0; j < lengthSub; j++)
                                subArray.push(b[i + j]);
                            i = i + (lengthSub - 1);
                        }

                    if (subArray.length >= length) {
                        if ((subArray[0]._quanbai === Card.kQuanbai_2 && subArray[lengthSub]._quanbai > a[0]._quanbai)
                            || subArray[0]._quanbai > a[0]._quanbai && subArray[lengthSub]._quanbai > a[lengthSub]._quanbai) {
                            for (var i = 0; i < subArray.length; i++) {
                                playable.push(subArray[i]._id);
                            }
                        }
                    }
                }
            }
            break;
        case GroupCard.kType_SANHDOC:
            if (b.length >= 3) {
                var difCards = [];
                difCards.push(new Card(b[0]._id));
                for (var i = 1; i < b.length; i++)
                    if (b[i]._quanbai !== b[i - 1]._quanbai)
                        difCards.push(new Card(b[i]._id));

                length = a.length;
                cc.log("checkBanCards GroupCard.kType_SANHDOC", difCards.length, length);
                cc.log("checkBanCards GroupCard.kType_SANHDOC", JSON.stringify(difCards));
                var lastPushDifCard = -1;
                if (difCards.length >= length) {
                    // check sanh
                    for (var i = 0; i < difCards.length - (length - 1); i++)
                        if (difCards[i + (length - 1)]._quanbai - difCards[i]._quanbai === length - 1 &&
                            difCards[i]._quanbai > a[0]._quanbai) {
                            for (var j = 0; j < length; j++) {
                                if (playable.length === 0 || difCards[i + j]._quanbai !== playable[playable.length - 1]._quanbai) {
                                    if (lastPushDifCard < i + j) {
                                        lastPushDifCard = i + j;
                                        playable.push(difCards[i + j]._id);
                                        for (var k = 0; k < b.length; k++)
                                            if (difCards[i + j]._quanbai === b[k]._quanbai && difCards[i + j]._id !== b[k]._id)
                                                playable.push(b[k]._id);
                                    }
                                }
                            }
                        }
                }
            }
            break;
    }
    return playable;
};
