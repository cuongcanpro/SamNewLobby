/**
 * Created by cuongleah on 2/25/2016.
 */
var MaubinhPlayerCard = cc.Class.extend({
    ctor: function () {
        this.GroupCards = [];
        this.ChiDau = new MaubinhGroupCardLogic();
        this.ChiGiua = new MaubinhGroupCardLogic();
        this.ChiCuoi = new MaubinhGroupCardLogic();
    },

    AddGroupCard: function(GCard) {
        // Convert code Binh
        this.GroupCards.push(GCard);
    },

    /**
     * Ham nay search card trong bo bai va tra ve vi tri cua card do neu tim
     * thay hoac tra ve -1 neu khong tim thay
     *
     * @param card
     * @return
     */
    SearchCard: function(card) {
        // Convert code Binh
        for (var i = 0; i < this.GetNumOfGroupCards(); i++) {
            for (var j = 0; j < this.GroupCards[i].GetNumOfCards(); j++) {
                if (this.GroupCards[i].Cards[j].ID == card.ID) {
                    return i;
                }
            }
        }
        return -1;
    },

    GetNumOfGroupCards: function() {
        // Convert code Binh
        return this.GroupCards.length;
    },

    Clear: function() {
        // Convert code Binh
        this.GroupCards = [];
    },

    SanhRong: function() {
        // Convert code Binh
        var gc = new MaubinhGroupCardLogic();
        for (var i = 0; i < this.GetNumOfGroupCards(); i++) {
            for (var j = 0; j < this.GroupCards[i].GetNumOfCards(); j++) {
                gc.AddCard(this.GroupCards[i].Cards[j]);
            }
        }
        if (gc.SanhRong())
            return true;
        return false;
    },

    CungMau: function() {
        // Convert code Binh
        var gc = new MaubinhGroupCardLogic();
        for (var i = 0; i < this.GetNumOfGroupCards(); i++) {
            for (var j = 0; j < this.GroupCards[i].GetNumOfCards(); j++) {
                gc.AddCard(this.GroupCards[i].Cards[j]);
            }
        }
        if (gc.CungMau())
            return true;
        return false;
    },

    MuoiHai: function() {
        // Convert code Binh
        var gc = new MaubinhGroupCardLogic();
        for (var i = 0; i < this.GetNumOfGroupCards(); i++) {
            for (var j = 0; j < this.GroupCards[i].GetNumOfCards(); j++) {
                gc.AddCard(this.GroupCards[i].Cards[j]);
            }
        }
        if (gc.MuoiHai())
            return true;
        return false;
    },

    SauDoi: function() {
        // Convert code Binh
        var gc = new MaubinhGroupCardLogic();
        for (var i = 0; i < this.GetNumOfGroupCards(); i++) {
            for (var j = 0; j < this.GroupCards[i].GetNumOfCards(); j++) {
                gc.AddCard(this.GroupCards[i].Cards[j]);
            }
        }
        cc.log("CHECK 6 DOI ");
        if (gc.SauDoi()) {
            cc.log("DA LA 6 doi ");
            this.ArrangeChi();
            if (this.ChiCuoi.GetGroupKind() == MaubinhGroupCardLogic.EG_THU) {
                cc.log("CHI CUOI THOA MAN ");
                if (this.ChiGiua.GetGroupKind() == MaubinhGroupCardLogic.EG_THU) {
                    cc.log("CHI GIUA THOA MAN ");
                    if (this.ChiDau.GetGroupKind() == MaubinhGroupCardLogic.EG_DOI) {
                        cc.log("CHI DAU THOA MAN ");
                        return true;
                    }
                }
            }
    
        }
        return false;
    },

    BaSanh: function() {
        // Convert code Binh
        this.ArrangeChi();
        if (this.ChiGiua.Sanh()) {
            if (this.ChiCuoi.Sanh()) {
                if (this.ChiDau.Sanh())
                    return true;
            }
        }
        return false;
    },

    BaThung: function() {
        // Convert code Binh
        this.ArrangeChi();
        if (this.ChiGiua.Thung() && this.ChiCuoi.Thung()) {
            if (this.ChiDau.Thung()) {
                return true;
            }
        }
        return false;
    },

    TuQui: function() {
        // Convert code Binh
        this.ArrangeChi();
        var gc = new MaubinhGroupCardLogic();
        for (var i = 0; i < this.GetNumOfGroupCards(); i++) {
            for (var j = 0; j < this.GroupCards[i].GetNumOfCards(); j++) {
                gc.AddCard(this.GroupCards[i].Cards[j]);
            }
        }
        if (gc.TuQui()) {
            return true;
        }
        return false;
    },

    ThungPhaSanh: function() {
        // Convert code Binh
        this.ArrangeChi();
        var gc = new MaubinhGroupCardLogic();
        for (var i = 0; i < this.GetNumOfGroupCards(); i++) {
            for (var j = 0; j < this.GroupCards[i].GetNumOfCards(); j++) {
                gc.AddCard(this.GroupCards[i].Cards[j]);
            }
        }

        if (gc.ThungPhaSanh()) {
            return true;
        }
        return false;
    },

    NamDoiThong: function() {
        // Convert code Binh
        this.ArrangeChi();
        var gc = new MaubinhGroupCardLogic();
        for (var i = 0; i < this.GetNumOfGroupCards(); i++) {
            for (var j = 0; j < this.GroupCards[i].GetNumOfCards(); j++) {
                gc.AddCard(this.GroupCards[i].Cards[j]);
            }
        }
        if (gc.NamDoiThong())
            return true;
        return false;
    },

    ArrangeChi: function() {
        // Convert code Binh
        this.ChiDau.Cards = [];
        this.ChiGiua.Cards = [];
        this.ChiCuoi.Cards = [];
        var i = 0;

        for (i = 0; i < 3; i++) {
            this.ChiDau.AddCard(this.GroupCards[i].Cards[0]);
        }
        for (i = 3; i < 3 + 5; i++) {
            this.ChiGiua.AddCard(this.GroupCards[i].Cards[0]);
        }
        for (i = 8; i < 13; i++) {
            this.ChiCuoi.AddCard(this.GroupCards[i].Cards[0]);
        }

    },

    GetPlayerCardsKind: function(isTinhAt) {
        // Convert code Binh
        if (this.GroupCards.length <= 0) {
            return MaubinhPlayerCard.EM_BINHLUNG;
        }
        this.ArrangeChi();

        // CHECK MAU BINH
        // ---------------------------------------------------
        // 20100614 truclc
        /*
         * if (CungMau()) return MaubinhPlayerCard.EM_13CUNGMAU; if (MuoiHai()) return
         * MaubinhPlayerCard.EM_12CUNGMAU;
         */
        // 20100614 truclc
        if (this.SanhRong())
            return MaubinhPlayerCard.EM_SANHRONG;
        if (isTinhAt)
        {
            if (this.MuoiBaCay())
                return MaubinhPlayerCard.EM_MUOI_BA;
            if (this.MuoiHaiCay())
                return MaubinhPlayerCard.EM_MUOI_HAI;
        }

        if (this.BaThung())
            return MaubinhPlayerCard.EM_3THUNG;
        if (this.BaSanh())
            return MaubinhPlayerCard.EM_3SANH;
        if (this.SauDoi())
            return MaubinhPlayerCard.EM_LUCPHEBON;

        /*
         * if(TuQui()) return MaubinhPlayerCard.EM_TUQUI; if(ThungPhaSanh()) return
         * MaubinhPlayerCard.EM_THUNGPHASANH;
         */
        /*
         * if(NamDoiThong()) return MaubinhPlayerCard.EM_NAMDOITHONG;
         */

        // Check BINH LUNG
        // ----------------------------------------------------
        var binhlung = true;
        var compareChiDauChiGiua = this.SoSanhChi(this.ChiDau, this.ChiGiua, isTinhAt);
        var compareChiGiuaChiCuoi = this.SoSanhChi(this.ChiGiua, this.ChiCuoi, isTinhAt);
        if (compareChiDauChiGiua == -1 || compareChiDauChiGiua == 0)
            if (compareChiGiuaChiCuoi == -1 || compareChiGiuaChiCuoi == 0) {
                binhlung = false;
            }
        if (binhlung)
            return MaubinhPlayerCard.EM_BINHLUNG;

        return MaubinhPlayerCard.EM_NORMAL;
    },

    getWrongChi2: function(isTinhAt){
        if (this.SoSanhChi(this.ChiDau, this.ChiGiua, isTinhAt) != -1)
            return true;
        return false;
    },

    getWrongChi1: function(isTinhAt){
        if (this.SoSanhChi(this.ChiGiua, this.ChiCuoi, isTinhAt) != -1) {
            return true;
        }
        return false;
    },

    isMauBinh: function() {
        if (this.GetPlayerCardsKind() != MaubinhPlayerCard.EM_BINHLUNG && this.GetPlayerCardsKind() != MaubinhPlayerCard.EM_NORMAL)
            return true;
        return false;
    },

    ApplyNew3GroupCards: function(chidau, chigiua, chicuoi) {
        var i;
        this.GroupCards = [];
        for (i = 0; i < chidau.GetNumOfCards(); ++i) {
            var _gc = new MaubinhGroupCardLogic();
            _gc.AddCard(chidau.Cards[i]);
            this.AddGroupCard(_gc);
        }
        for (i = 0; i < chigiua.GetNumOfCards(); ++i) {
            var _gc1 = new MaubinhGroupCardLogic();
            _gc1.AddCard(chigiua.Cards[i]);
            this.AddGroupCard(_gc1);
        }
        for (i = 0; i < chicuoi.GetNumOfCards(); ++i) {
            var _gc2 = new MaubinhGroupCardLogic();
            _gc2.AddCard(chicuoi.Cards[i]);
            this.AddGroupCard(_gc2);
        }
    
        this.ArrangeChi();
    },

    GetCard: function(id) {
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
    
    SapXepTruocSoBai: function() {
        this.ArrangeChi();
        this.ChiDau.SapXepTruocSoBai2();
        this.ChiGiua.SapXepTruocSoBai2();
        this.ChiCuoi.SapXepTruocSoBai2();

        this.ApplyNew3GroupCards(this.ChiDau, this.ChiGiua, this.ChiCuoi);

    },
    
    MuoiBaCay: function()
    {
        var countBlack = 0;
        var countRed = 0;
        for (var i = 0; i < this.GetNumOfGroupCards(); i++) {
        for (var j = 0; j < this.GroupCards[i].GetNumOfCards(); j++) {
           
            if (this.GroupCards[i].Cards[j].GetSuit() == 3 || this.GroupCards[i].Cards[j].GetSuit() == 4)
            {
                countRed++;
            }
            else
            {
                countBlack++;
            }
        }
    }
        if (countBlack >= 13 || countRed >= 13)
            return true;
        return false;
    },
    
    MuoiHaiCay: function()
    {
        var countBlack = 0;
        var countRed = 0;
        for (var i = 0; i < this.GetNumOfGroupCards(); i++) {
        for (var j = 0; j < this.GroupCards[i].GetNumOfCards(); j++) {
            if (this.GroupCards[i].Cards[j].GetSuit() == 3 || this.GroupCards[i].Cards[j].GetSuit() == 4)
            {
                countRed++;
            }
            else
            {
                countBlack++;
            }
        }
        }
        if (countBlack >= 12 || countRed >= 12)
            return true;
        return false;
    },
    
    GetPlayerCardsKindBao: function(checkBinhLung, isTinhAt)
    {
        if (this.SanhRong())
            return MaubinhPlayerCard.EM_SANHRONG;

        if (this.MuoiBaCay())
            return MaubinhPlayerCard.EM_MUOI_BA;
        if (this.MuoiHaiCay())
            return MaubinhPlayerCard.EM_MUOI_HAI;
    
        // Check 3 cai thung
        var arrayKind  = [0, 0, 0, 0 , 0];
        var arrayCount = new Array(15);
        for (var i = 0; i < 15; i++)
            arrayCount[i] = 0;
    
        for (var i = 0; i < this.GetNumOfGroupCards(); i++) {
            for (var j = 0; j < this.GroupCards[i].GetNumOfCards(); j++) {
                //gc.AddCard(this.GroupCards[i].Cards[j]);
                arrayKind[this.GroupCards[i].Cards[j].GetSuit()] = arrayKind[this.GroupCards[i].Cards[j].GetSuit()] + 1;
            }
        }
    
        for (var i = 0; i < 5; i++)
        {
            arrayCount[arrayKind[i]] = arrayCount[arrayKind[i]] + 1;
        }
    
        if (arrayCount[5] == 2 && arrayCount[3] == 1 || arrayCount[10] == 1 && arrayCount[3] == 1 || arrayCount[8] == 1 && arrayCount[5] == 1)
        {
            return MaubinhPlayerCard.EM_3THUNG;
        }
    
    
        if (this.BaSanh2())
            return MaubinhPlayerCard.EM_3SANH;
    
    
        for (var i = 0; i < 15; i++)
        {
            arrayCount[i] = 0;
        }
        for (var i = 0; i < this.GetNumOfGroupCards(); i++) {
            for (var j = 0; j < this.GroupCards[i].GetNumOfCards(); j++) {
                //gc.AddCard(this.GroupCards[i].Cards[j]);
                arrayCount[this.GroupCards[i].Cards[j].GetNumber()] = arrayCount[this.GroupCards[i].Cards[j].GetNumber()] + 1;
            }
        }
    
        var countPair = 0;
        for (var i = 0; i < 15; i++)
        {
            countPair = countPair + Math.floor(arrayCount[i] / 2);
        }
    
        if (countPair == 6)
        {
            return MaubinhPlayerCard.EM_LUCPHEBON;
        }

        if (checkBinhLung)
        {
            var binhlung = true;
            var compareChiDauChiGiua = this.SoSanhChi(this.ChiDau, this.ChiGiua, true);
            var compareChiGiuaChiCuoi = this.SoSanhChi(this.ChiGiua, this.ChiCuoi, true);
            if (compareChiDauChiGiua == -1 || compareChiDauChiGiua == 0)
                if (compareChiGiuaChiCuoi == -1 || compareChiGiuaChiCuoi == 0) {
                    binhlung = false;
                }
            
            if (binhlung)
                return MaubinhPlayerCard.EM_BINHLUNG;
        }
    
        return MaubinhPlayerCard.EM_NORMAL;
    },
    
    BaSanh2: function()
    {
    
        var i, j, ii, z;
        var iNum;
        var number = [];
        var n, x;
        var index, index2;
    
        for (i = 0; i < this.GetNumOfGroupCards(); i++)
        {
            for (j = 0; j < this.GroupCards[i].GetNumOfCards(); j++)
            {
                n = this.GroupCards[i].Cards[j].GetNumber();
                number.push(n);
            }
        }
        //sap xep theo number tang dan
        for (i = 0; i < number.length; i++)
        {
            for (j = i + 1; j < number.length; j++)
            {
                if (number[i] > number[j])
                {
                    iNum = number[i];
                    number[i] = number[j];
                    number[j] = iNum;
                }
            }
        }
        for (i = 0; i < number.length - 3; i++)
        {
            var arr = [];
            var arr1 = [];
            arr.push(number[i]);
            for (j = 0; j < number.length; j++)
            {
                if (arr[arr.length - 1] + 1 == number[j] && arr.length < 4)
                {
                    arr.push(number[j]);
                }
                else if (arr[arr.length - 1] == 5 && number[j] == 14 && arr.length < 4 && arr[0] == 2)
                    arr.push(number[j]);
                else if (i != j)
                    arr1.push(number[j]);
            }
            if (arr.length == 4 && arr1.length == 9)
            {
                index = -1;
                for (z = 0; z < arr1.length; z++)
                {
                    if (arr[arr.length - 1] + 1 != arr1[z] && arr1[z] != 14)
                        continue;
                    var mang1 = [];
                    var mang2 = [];
                    for (j = 0; j < arr.length; j++)
                        mang1.push(arr[j]);
                    for (j = 0; j < arr1.length; j++)
                    {
                        if (mang1[mang1.length - 1] + 1 == arr1[j] && mang1.length < 5 && j != index)
                        {
                            mang1.push(arr1[j]);
                            index = j;
                            //break;
                        }
                        else if (mang1[arr.length - 1] == 5 && arr1[j] == 14 && mang1.length < 5 && mang1[0] == 2 && j != index)
                        {
                            mang1.push(arr1[j]);
                            index = j;
                            //break;
                        }
                        else
                            mang2.push(arr1[j]);
                    }
                    if (mang1.length == 5 && mang2.length == 8)
                    {
                        for (j = 0; j < mang2.length - 3; j++)
                        {
                            var s1 = [];
                            var s2 = [];
                            s1.push(mang2[j]);
                            for (x = 0; x < mang2.length; x++)
                            {
                                if (s1[s1.length - 1] + 1 == mang2[x] && s1.length < 4)
                                    s1.push(mang2[x]);
                                else if (s1[s1.length - 1] == 5 && mang2[x] == 14 && s1.length < 4 && s1[0] == 2)
                                    s1.push(mang2[x]);
                                else if (j != x)
                                {
                                    s2.push(mang2[x]);
                                }
                            }
                            if (s1.length == 4 && s2.length == 4)
                            {
                                index2 = -1;
                                for (x = 0; x < s2.length; x++)
                                {
                                    if (s1[s1.length - 1] + 1 != s2[x] && s2[x] != 14)
                                        continue;
    
                                    var mang3 = [];
                                    var mang4 = [];
                                    var xx;
                                    for (xx = 0; xx < s1.length; xx++)
                                        mang3.push(s1[xx]);
                                    for (n = 0; n < s2.length; n++)
                                    {
                                        if (mang3[mang3.length - 1] + 1 == s2[n] && mang3.length < 5 && n != index2)
                                        {
                                            mang3.push(s2[n]);
                                            index2 = n;
                                        }
                                        else if (mang3[mang3.length - 1] == 5 && s2[n] == 14 && mang3.length < 5 && mang3[0] == 2 && n != index2)
                                        {
                                            mang3.push(s2[n]);
                                            index2 = n;
                                        }
                                        else
                                            mang4.push(s2[n]);
                                    }
                                    if (mang3.length == 5 && mang4.length == 3)
                                    {
    
                                        var isSequence = true;
                                        n = mang4[0];
                                        var at = false;
    
                                        for (xx = 1; xx < mang4.length; xx++)
                                        {
                                            if (n == 3 && mang4[xx] == 14 && !at)
                                            {
                                                at = true;
                                                continue;
                                            }
                                            if (n + 1 != mang4[xx])
                                            {
                                                isSequence = false;
                                                break;
                                            }
                                            n = mang4[xx];
                                        }
                                        if (isSequence)
                                        {
                                            return true;
                                        }
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
    
    ArrangePlayerCardsBao: function()
    {
        var arrayId = new Array(13);
        var kind = this.GetPlayerCardsKindBao(false);
        if (kind == MaubinhPlayerCard.EM_SANHRONG || kind == MaubinhPlayerCard.EM_MUOI_HAI || kind == MaubinhPlayerCard.EM_MUOI_BA)
        {
            var count = 0;
            for (var i = 0; i < this.GetNumOfGroupCards(); i++) {
                for (var j = 0; j < this.GroupCards[i].GetNumOfCards(); j++) {
                    arrayId[count] = this.GroupCards[i].Cards[j].ID;
                    count++;
                }
            }
            return arrayId;
        }
        else
        {
            if (kind == MaubinhPlayerCard.EM_3THUNG)
            {
                var arrayKind = [ 0, 0, 0, 0, 0 ];
                //vector<vector<int>> arrayNumKind;
                var arrayNumKind = [];
                for (var i = 0; i < 5; i++)
                {
                    arrayNum = [];
                    arrayNumKind.push(arrayNum);
                }
    
                for (var i = 0; i < this.GetNumOfGroupCards(); i++) {
                    for (var j = 0; j < this.GroupCards[i].GetNumOfCards(); j++) {
                        //gc.AddCard(this.GroupCards[i].Cards[j]);
                        //arrayKind[this.GroupCards[i].Cards[j].GetSuit()] = arrayKind[this.GroupCards[i].Cards[j].GetSuit()] + 1;
                        arrayNumKind[this.GroupCards[i].Cards[j].GetSuit()].push(this.GroupCards[i].Cards[j].ID);
                    }
                }
    
                var count = 0;
                var next = true;
                for (var i = 0; i < 5; i++)
                {
                    if (arrayNumKind[i].length == 5 || arrayNumKind[i].length == 10)
                    {
                        for (var j = 0; j < arrayNumKind[i].length; j++)
                        {
                            arrayId[count] = arrayNumKind[i][j];
                            count++;
                        }
                    }
                    else if (arrayNumKind[i].length == 8)
                    {
                        var j;
                        for (j = 0; j < 5; j++)
                        {
                            arrayId[count] = arrayNumKind[i][j];
                            count++;
                        }
                        for (; j < 8; j++)
                        {
                            arrayId[10 + j - 5] = arrayNumKind[i][j];
                        }
                        next = false;
                    }
    
                }
                if (next)
                {
                    for (var i = 0; i < 5; i++)
                    {
                        if (arrayNumKind[i].length == 3)
                        {
                            for (var j = 0; j < arrayNumKind[i].length; j++)
                            {
                                arrayId[count] = arrayNumKind[i][j];
                                count++;
                            }
                        }
                    }
                }
                return arrayId;
            }
            else if (kind == MaubinhPlayerCard.EM_3SANH)
            {
                var i, j, ii, z;
                var iNum;
                var number = new Array(13);
                var n, x;
                var index = 0;
                var index2 = 0;
                var iNumCard = 13;
                for (i = 0; i < iNumCard; i++)
                {
                    iNum = Math.floor(arrayId[i] / 4) + 2;
                    number[i] = iNum;
                }
    
                var count = 0;
                for (var i = 0; i < this.GetNumOfGroupCards(); i++) {
                    for (var j = 0; j < this.GroupCards[i].GetNumOfCards(); j++) {
                        //gc.AddCard(this.GroupCards[i].Cards[j]);
                        //arrayKind[this.GroupCards[i].Cards[j].GetSuit()] = arrayKind[this.GroupCards[i].Cards[j].GetSuit()] + 1;
                        //arrayNumKind[this.GroupCards[i].Cards[j].GetSuit()).push(this.GroupCards[i].Cards[j].ID);
                        iNum = this.GroupCards[i].Cards[j].GetNumber();
                        number[count] = iNum;
                        count++;
                    }
                }
    
                //sap xep theo number tang dan
                for (i = 0; i < 13; i++)
                {
                    for (j = i + 1; j < 13; j++)
                    {
                        if (number[i] > number[j])
                        {
                            iNum = number[i];
                            number[i] = number[j];
                            number[j] = iNum;
                        }
                    }
                }
                for (i = 0; i < 13 - 3; i++)
                {
    
                    var arr = [];
                    var arr1 = [];
                    arr.push(number[i]);
                    for (j = 0; j < 13; j++)
                    {
                        if (arr[arr.length - 1] + 1 == number[j] && arr.length < 4)
                        {
                            arr.push(number[j]);
                        }
                        else if (arr[arr.length - 1] == 5 && number[j] == 14 && arr.length < 4 && arr[0] == 2)
                            arr.push(number[j]);
                        else if (i != j)
                            arr1.push(number[j]);
                    }
                    if (arr.length == 4 && arr1.length == 9)
                    {
                        index = -1;
                        for (z = 0; z < arr1.length; z++)
                        {
                            if (arr[arr.length - 1] + 1 != arr1[z] && arr1[z] != 14)
                                continue;
                            var mang1 = [];
                            var mang2 = [];
                            for (j = 0; j < arr.length; j++)
                                mang1.push(arr[j]);
                            for (j = 0; j < arr1.length; j++)
                            {
                                if (mang1[mang1.length - 1] + 1 == arr1[j] && mang1.length < 5 && index != j)
                                {
                                    mang1.push(arr1[j]);
                                    index = j;
                                    //break;
                                }
                                else if (mang1[arr.length - 1] == 5 && arr1[j] == 14 && mang1.length < 5 && mang1[0] == 2 && index != j)
                                {
                                    mang1.push(arr1[j]);
                                    index = j;
                                    //break;
                                }
                                else
                                    mang2.push(arr1[j]);
                            }
                            if (mang1.length == 5 && mang2.length == 8)
                            {
                                for (j = 0; j < mang2.length - 3; j++)
                                {
    
                                    var s1 = [];
                                    var s2 = [];
                                    s1.push(mang2[j]);
                                    for (x = 0; x < mang2.length; x++)
                                    {
                                        if (s1[s1.length - 1] + 1 == mang2[x] && s1.length < 4)
                                            s1.push(mang2[x]);
                                        else if (s1[s1.length - 1] == 5 && mang2[x] == 14 && s1.length < 4 && s1[0] == 2)
                                            s1.push(mang2[x]);
                                        else if (j != x)
                                        {
                                            s2.push(mang2[x]);
                                        }
                                    }
                                    if (s1.length == 4 && s2.length == 4)
                                    {
                                        index2 = -1;
                                        for (x = 0; x < s2.length; x++)
                                        {
                                            if (s1[s1.length - 1] + 1 != s2[x] && s2[x] != 14)
                                                continue;
                                            var mang3 = [];
                                            var mang4 = [];
                                            var xx;
                                            for (xx = 0; xx < s1.length; xx++)
                                                mang3.push(s1[xx]);
                                            for (n = 0; n < s2.length; n++)
                                            {
                                                if (mang3[mang3.length - 1] + 1 == s2[n] && mang3.length < 5 && index2 != n)
                                                {
                                                    mang3.push(s2[n]);
                                                    index2 = n;
                                                }
                                                else if (mang3[mang3.length - 1] == 5 && s2[n] == 14 && mang3.length < 5 && mang3[0] == 2 && index2 != n)
                                                {
                                                    mang3.push(s2[n]);
                                                    index2 = n;
                                                }
                                                else
                                                    mang4.push(s2[n]);
                                            }
                                            if (mang3.length == 5 && mang4.length == 3)
                                            {
    
                                                var isSequence = true;
                                                n = mang4[0];
                                                var at = false;
                                                for (xx = 1; xx < mang4.length; xx++)
                                                {
                                                    if (n == 3 && mang4[xx] == 14 && !at)
                                                    {
                                                        at = true;
                                                        continue;
                                                    }
                                                    if (n + 1 != mang4[xx])
                                                    {
                                                        isSequence = false;
                                                        break;
                                                    }
                                                    n = mang4[xx];
                                                }
                                                if (isSequence)
                                                {
    
                                                    var result = [];
                                                    for (x = 0; x < 3; x++)
                                                    {
                                                        result.push(mang4[x]);
                                                    }
                                                    for (x = 0; x < 5; x++)
                                                    {
                                                        result.push(mang1[x]);
                                                    }
                                                    for (x = 0; x < 5; x++)
                                                    {
                                                        result.push(mang3[x]);
                                                    }
                                                    for (x = 0; x < iNumCard; x++)
                                                    {
    
    
                                                        for (var i1 = 0; i1 < this.GetNumOfGroupCards(); i1++) {
                                                        for (var j1= 0; j1 < this.GroupCards[i1].GetNumOfCards(); j1++) {
                                                            if (this.GroupCards[i1].Cards[j1].GetNumber() == result[12-x])
                                                            {
                                                                var k;
                                                                for (k = 0; k < x; k++)
                                                                {
                                                                    if (arrayId[k] == this.GroupCards[i1].Cards[j1].ID)
                                                                        break;
                                                                }
                                                                if (k == x)
                                                                {
                                                                    arrayId[x] = this.GroupCards[i1].Cards[j1].ID;
                                                                }
                                                            }
                                                        }
                                                    }
    
                                                    }
                                                    return arrayId;
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
            else if (kind == MaubinhPlayerCard.EM_LUCPHEBON)
            {
                var arrayKind = [ 0, 0, 0, 0, 0 ];
                arrayNumKind = [];
                for (var i = 0; i < 15; i++)
                {
                    var arrayNum = [];
                    arrayNumKind.push(arrayNum);
                }
    
                for (var i = 0; i < this.GetNumOfGroupCards(); i++) {
                    for (var j = 0; j < this.GroupCards[i].GetNumOfCards(); j++) {
                        //gc.AddCard(this.GroupCards[i].Cards[j]);
                        //arrayKind[this.GroupCards[i].Cards[j].GetSuit()] = arrayKind[this.GroupCards[i].Cards[j].GetSuit()] + 1;
                        arrayNumKind[this.GroupCards[i].Cards[j].GetNumber()].push(this.GroupCards[i].Cards[j].ID);
                    }
                }
    
                var count = 0;
                var numPair = 0;
                for (var i = 14; i >= 0; i--)
                {
                    if (arrayNumKind[i].length >= 2)
                    {
                        arrayId[count] = arrayNumKind[i][arrayNumKind[i].length - 1];
                        arrayNumKind[i].pop();
                        count++;
    
                        arrayId[count] = arrayNumKind[i][arrayNumKind[i].length - 1];
                        arrayNumKind[i].pop();
                        count++;
                        numPair++;
                        if (numPair == 2)
                            break;
                    }
                }
    
                for (var i = 0; i < 15; i++)
                {
                    if (arrayNumKind[i].length > 0)
                    {
                        var j;
                        for (j = 0; j < 4; j++) {
                            cc.log("ID 1 va 2 " + Math.floor(arrayId[j] / 4) + "  " + Math.floor(arrayNumKind[i][0] / 4));
                            if (Math.floor(arrayId[j] / 4) == Math.floor(arrayNumKind[i][0] / 4))
                                break;
                        }
                        if (j == 4)
                        {
                            cc.log("ID CARD LAY " + arrayNumKind[i][arrayNumKind[i].length-1]);
                            arrayId[count] = arrayNumKind[i][arrayNumKind[i].length-1];
                            arrayNumKind[i].pop();
                            count++;
                            break;
                        }
    
                    }
                }
    
                for (var i = 14; i >= 0; i--)
                {
                    if (arrayNumKind[i].length >= 2)
                    {
                        arrayId[count] = arrayNumKind[i][arrayNumKind[i].length - 1];
                        arrayNumKind[i].pop();
                        count++;
    
                        arrayId[count] = arrayNumKind[i][arrayNumKind[i].length - 1];
                        arrayNumKind[i].pop();
                        count++;
                        numPair++;
                        if (numPair == 4)
                            break;
                    }
                }
    
                for (var i = 0; i < 15; i++)
                {
                    if (arrayNumKind[i].length > 0)
                    {
                        var j;
                        for (j = 5; j < 10; j++)
                            if (Math.floor(arrayId[j] / 4) == Math.floor(arrayNumKind[i][0] / 4))
                                break;
                        if (j == 10)
                        {
                            arrayId[count] = arrayNumKind[i][arrayNumKind[i].length - 1];
                            arrayNumKind[i].pop();
                            count++;
                            break;
                        }
    
                    }
                }
    
                for (var i = 0; i < 15; i++)
                {
                    if (arrayNumKind[i].length >= 1)
                    {
                        for (var j = 0; j < arrayNumKind[i].length; j++)
                        {
                            arrayId[count] = arrayNumKind[i][j];
                            count++;
                        }
                    }
    
                }
    
                return arrayId;
            }
        }
    },
    
    isLung: function()
    {
        var binhlung = true;
        var compareChiDauChiGiua = this.SoSanhChi(this.ChiDau, this.ChiGiua, true);
        var compareChiGiuaChiCuoi = this.SoSanhChi(this.ChiGiua, this.ChiCuoi, true);
        if (compareChiDauChiGiua == -1 || compareChiDauChiGiua == 0)
            if (compareChiGiuaChiCuoi == -1 || compareChiGiuaChiCuoi == 0) {
                binhlung = false;
            }
        return binhlung;
    },

    SoSanhChi: function(gc1, gc2, isTinhAt) {
        if (gc1.GetGroupKind() < gc2.GetGroupKind()) {
            return 1;
        }
        // Neu chi 1 co loai lon hon thi thua, tra ve -1
        if (gc1.GetGroupKind() > gc2.GetGroupKind()) {
            return -1;
        }
        // Neu 2 chi co cung loai
        if (gc1.GetGroupKind() == gc2.GetGroupKind()) {
            switch (gc1.GetGroupKind()) {
                // Neu la sanh thi chi can so sanh quan bai to nhat cua chi
                case MaubinhGroupCardLogic.EG_THUNGPHASANHTHUONG:
                    return -1;
                case MaubinhGroupCardLogic.EG_THUNGPHASANH:
                case MaubinhGroupCardLogic.EG_SANH: {
                    var num1 = gc1.GetMaxNumber();
                    var num2 = gc2.GetMaxNumber();

                    if (isTinhAt)
                    {
                        if (num1 > num2)
                        {
                            if (num1 == 14)
                                return 1;
                            if (num2 == 5)  // sanh ha
                                return -1;
                            return 1;
                        }

                        if (num1 < num2)
                        {
                            if (num2 == 14)
                                return -1;
                            if (num1 == 5)
                                return 1;
                            return -1;
                        }
                        if (num1 == num2)
                            return -1;
                    }
                    else
                    {
                        if (num1 > num2)
                            return 1;
                        if (num1 <= num2)
                            return -1;
                    }

                    break;
                }
                // Cac loai nay se so sanh cac gia tri bai voi nhau
                case MaubinhGroupCardLogic.EG_TUQUI:
                case MaubinhGroupCardLogic.EG_CULU:
                case MaubinhGroupCardLogic.EG_THUNG:
                case MaubinhGroupCardLogic.EG_SAMCO:
                case MaubinhGroupCardLogic.EG_THU:
                case MaubinhGroupCardLogic.EG_DOI:
                case MaubinhGroupCardLogic.EG_MAUTHAU: {
                    for (var i = 0; i < gc1.Value.length; i++) {
                        if (gc1.Value[i] > gc2.Value[i])
                            return 1;
                        if (gc1.Value[i] < gc2.Value[i])
                            return -1;
                        if (gc1.Value[i] == gc2.Value[i])
                            continue;
                    }
                    break;
                }
            }
        }
        return 0;
    }
});

MaubinhPlayerCard.EM_SANHRONG = 0
MaubinhPlayerCard.EM_3THUNG = 1
MaubinhPlayerCard.EM_3SANH = 2
MaubinhPlayerCard.EM_LUCPHEBON = 3
MaubinhPlayerCard.EM_NORMAL = 4
MaubinhPlayerCard.EM_BINHLUNG = 5
MaubinhPlayerCard.EM_MUOI_BA = 6
MaubinhPlayerCard.EM_MUOI_HAI = 7