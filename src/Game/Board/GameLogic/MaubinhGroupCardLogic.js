/**
 * Created by cuongleah on 2/24/2016.
 */
var MaubinhGroupCardLogic = cc.Class.extend({
    ctor: function () {
        this.Value = [];
        this.Cards = [];
    },

    GetNumOfCards: function() {
    // Convert code Binh
        return this.Cards.length;
    },

    GetGroupKind: function(isTinhAt) {
        // Convert code Binh
        // ************************************************
        // PHAN LOAI BO 3 QUAN
        // ************************************************
        var j;
        if (this.GetNumOfCards() == 3) {
            // Check Xam chi
            if (this.XamChi())
                return MaubinhGroupCardLogic.EG_SAMCO;
            if (this.MotDoi())
                return MaubinhGroupCardLogic.EG_DOI;

            this.Reset();
            for (j = 2; j >= 0; j--)
                this.Value.push(this.Cards[j].GetNumber());
            return MaubinhGroupCardLogic.EG_MAUTHAU;

        }

        // ************************************************
        // PHAN LOAI BO 5 QUAN
        // ************************************************
        if (this.GetNumOfCards() == 5) {
            if (isTinhAt)
            {
                if (this.ThungPhaSanhThuong())
                    return MaubinhGroupCardLogic.EG_THUNGPHASANHTHUONG;
            }
            if (this.ThungPhaSanh())
                return MaubinhGroupCardLogic.EG_THUNGPHASANH;
            if (this.TuQui())
                return MaubinhGroupCardLogic.EG_TUQUI;
            if (this.CuLu())
                return MaubinhGroupCardLogic.EG_CULU;
            if (this.Thung())
                return MaubinhGroupCardLogic.EG_THUNG;
            if (this.Sanh())
                return MaubinhGroupCardLogic.EG_SANH;
            if (this.XamChi())
                return MaubinhGroupCardLogic.EG_SAMCO;
            if (this.HaiDoiKhacNhau())
                return MaubinhGroupCardLogic.EG_THU;
            if (this.MotDoi())
                return MaubinhGroupCardLogic.EG_DOI;
        }
        if (this.GetNumOfCards() == 1) {
            return MaubinhGroupCardLogic.EG_MAUTHAU;
        }
            this.Reset();
        for (j = 4; j >= 0; j--)
            this.Value.push(this.Cards[j].GetNumber());
        return MaubinhGroupCardLogic.EG_MAUTHAU;
    },

    ThungPhaSanh: function() {
        // Convert code Binh
        // Check THUNG PHA SANH gom 5 la bai lien tiep cung chat
        // ----------------------------------------------
        var bai = new Array(4);//[15]; // bai[i][j] trong bai co quan j
        var i, j;
        for(i = 0; i < 4; i++)
            bai[i] = new Array(15);
        // chat ihay khong?

        for (i = 0; i < 4; i++) {
            for (j = 0; j < 15; j++)
                bai[i][j] = false;
        }
        for (i = 0; i < this.GetNumOfCards(); ++i) {
            try {
                bai[this.Cards[i].GetSuit() - 1][this.Cards[i].GetNumber()] = true;
            }
            catch (e) {
                var arr = "";
                for (var k = 0; k < this.GetNumOfCards(); k++) {
                    if (this.Cards[k]) {
                        arr = arr + " " + this.Cards[k].ID;
                    }
                }
                var log = " Thung Pha Sanh " + arr + " SUIT: " + this.Cards[i].GetSuit();
                var s = "JavaScript error: assets/src/Game/Board/GameLogic/MaubinhGroupCardLogic.js line 9999TypeError: " + log;
                NativeBridge.logJSManual("assets/src/Game/Board/GameLogic/MaubinhGroupCardLogic.js", "9999", s, NativeBridge.getVersionString());
                throw "Exeption";
            }
            if (this.Cards[i].GetNumber() == 14) // 'A'
                bai[this.Cards[i].GetSuit() - 1][1] = true;
        }

        var found = false;
        for (i = 0; i < 4 && !found; ++i) {
            j = 1;
            while (!found && j <= 10) {
                if (bai[i][j]) {
                    var k = j + 1;
                    // while (k <= j+4 && bai[i][(k-1)%13+1]) k++;
                    while (k <= j + 4 && bai[i][k])
                        k++;
                    k--;
                    if (k >= j + 4)
                        found = true;
                    j = k + 1;
                } else
                    j++;
            }
        }
        return found;
    },

    ThungPhaSanhThuong: function() {

        if (!this.ThungPhaSanh())
            return false;
        var isAt = false;
        var isK = false;
        var i;
        for (i = 0; i < this.GetNumOfCards(); ++i) {

            if (this.Cards[i].GetNumber() == 14) // 'A'
                isAt = true;
            else if (this.Cards[i].GetNumber() == 13) // 'A'
                isK = true;
        }

        return isAt && isK;
    },

    TuQui: function() {
        if (this.GetNumOfCards() < 5)
            return false;
        // Convert code Binh
        var i;
        var val = 0;
        // Kiem tra tu tung quan bai mot voi so quan bai con lai, dem xem co bao
        // nhieu con
        // trong bo bai giong quan bai do
        var k = 0;
        var j;
        for (i = 0; i < this.GetNumOfCards(); i++) {
            k = 0;
            for ( j = 0; j < this.GetNumOfCards(); j++) {
                if (j != i) {
                    if (this.Cards[j].GetNumber() == this.Cards[i].GetNumber()) {
                        k++;
                        val = this.Cards[i].GetNumber();
                    }
                }
            }
            if (k == 3) {
                // Doan code nay dung de so sanh cac group cung loai voi nhau
                // Voi tu qui thi se so sanh gia tri tu qui truoc, quan bai them
                // sau
                // Tat nhien la khong the xay ra truong hop 2 tu qui giong nhau
                // nen khong
                // can quan tam den quan bai them
                this.Reset();
                this.Value.push(val);
                return true;
            }
        }
        return false;
    },

    CuLu: function() {
        if (this.GetNumOfCards() < 5)
            return false;
        // Convert code Binh
        // Check Cu lu: Gom 3 la bai giong nhau va mot doi giong nhau
        // -------------------------------------------------------------
        var BoDoi = false;
        var BoBa = false;
        var i = 0;
        var j = 0;
        var k = 0;
        // Sap xep lai Group
        for (i = 0; i < this.GetNumOfCards() - 1; i++)
            for (j = i + 1; j < this.GetNumOfCards(); j++) {
            if (this.Cards[i].GetNumber() > this.Cards[j].GetNumber()) {

                /*var oldId = Cards[i].ID;
                 Cards[i].ID = Cards[j].ID;
                 Cards[j].ID = oldId;*/

                this.swap(i, j);

            }
        }
        var k = 0;
        for (i = 0; i < 3; i++) {
            if (this.Cards[i].GetNumber() == this.Cards[0].GetNumber())
                k++;
        }
        switch (k) {
            case 2: {
                BoDoi = true;
                break;
            }
            case 3: {
                BoBa = true;
                break;
            }
        }

        var val1 = 0;
        var val2 = 0;
        if (BoDoi) {
            k = 0;
            for (i = 2; i < 5; i++) {
                if (this.Cards[i].GetNumber() == this.Cards[3].GetNumber())
                    k++;
            }

            if (k == 3) {
                val1 = this.Cards[3].GetNumber();
                val2 = this.Cards[0].GetNumber();
                this. Reset();
                this.Value.push(val1);
                this.Value.push(val2);
                return true;
            }
        }
        if (BoBa) {
            k = 0;
            for (i = 3; i < 5; i++) {
                if (this.Cards[i].GetNumber() == this.Cards[4].GetNumber())
                    k++;
            }
            if (k == 2) {
                val1 = this.Cards[0].GetNumber();
                val2 = this.Cards[3].GetNumber();
                this.Reset();
                this.Value.push(val1);
                this.Value.push(val2);
                return true;
            }
        }
        return false;
    },

    Thung: function() {
        // Convert code Binh
        var i = 0;
        // Thung gom nam la bai cung chat
        for (i = 0; i < this.GetNumOfCards(); i++) {
            if (this.Cards[i].GetSuit() != this.Cards[0].GetSuit())
                return false;
        }

        // Voi 5 la bai dong chat thi ta sap xep lai group roi
        // push 5 gia tri nay theo thu tu giam dan vao mang
        // Khi so sanh 2 chi se dung 5 gia tri nay de so sanh
        this.Reset();
        for (i = this.GetNumOfCards() - 1; i >= 0; i--) {
            this.Value.push(this.Cards[i].GetNumber());
        }
        return true;
    },

    Sanh: function() {
        if (this.Cards.length < 3)
            return false;
        // Convert code Binh
        // Sanh la mot day bai lien tiep nhau
        var i = 0;
        var j = 0;
        // Sap xep lai Group
        for (i = 0; i < this.GetNumOfCards() - 1; i++)
            for (j = i + 1; j < this.GetNumOfCards(); j++) {
            if (this.Cards[i].GetNumber() > this.Cards[j].GetNumber()) {

                /*var oldId = Cards[i].ID;
                 Cards[i].ID = Cards[j].ID;
                 Cards[j].ID = oldId;*/
                this.swap(i, j);

            }
        }

        var number = this.Cards[0].GetNumber();

        if (this.Cards[0].GetNumber() == 2) {
            var SanhA = true;
            for (i = 0; i < this.GetNumOfCards() - 2; i++) {
                if (this.Cards[i].GetNumber() + 1 != this.Cards[i + 1].GetNumber())
                    SanhA = false;
            }
            if (this.Cards[this.GetNumOfCards() - 1].GetNumber() != 14)
                SanhA = false;
            if (SanhA)
                return true;
        }
        // Chay tu dau den cuoi group, neu chi can mot con number khong tien len
        // hoac
        // Suit khac di
        // thi khong phai sequence
        for (i = 1; i < this.GetNumOfCards(); i++) {
            if (this.Cards[i].GetNumber() != number + i)
                return false;

        }
        return true;
    },

    XamChi: function() {
        // Convert code Binh
        // Xam Chi se gom 3 quan bai giong nhau va 2 con con` lai khac nhau
        var i;
        var val = 0;
        // Kiem tra tung quan bai mot voi so quan bai con lai, dem xem co bao
        // nhieu
        // con
        // trong bo bai giong quan bai do
        for (i = 0; i < this.GetNumOfCards(); i++) {
            var k = 0;
            for (var j = 0; j < this.GetNumOfCards(); j++) {
                if (j != i)
                    if (this.Cards[j].GetNumber() == this.Cards[i].GetNumber()) {
                        k++;
                        val = this.Cards[j].GetNumber();
                    }
            }
            if (k == 2) {
                // Voi Xam chi thi cung chi can so sanh bo 3 la du
                // Vi khong bao gio co 2 bo ba giong nhau
                // Vi the ta chi can luu lai gia tri cua bo ba
                this.Reset();
                this.Value.push(val);
                return true;
            }
        }
        return false;
    },

    HaiDoiKhacNhau: function() {
        if (this.GetNumOfCards() < 5)
            return false;
        // Convert code Binh
        var Doi = [];
        var i = 0;
        var j = 0;
        var k = 0;

        // Dem so doi co trong 5 la bai
        for (i = 0; i < this.GetNumOfCards() - 1; i++) {
            for (j = i + 1; j < this.GetNumOfCards(); j++) {
                if (this.Cards[i].GetNumber() == this.Cards[j].GetNumber()) {
                    Doi.push(this.Cards[i].GetNumber());
                    k++;
                }
            }
        }

        for (i = 0; i < k - 1; i++) {
            if (Doi[i] != Doi[i + 1]) {
                // Neu 2 doi khac nhau thi se luu lai 3 gia tri
                // Mot la doi co gia tri lon hon
                // Hai la doi co gia tri nho hon
                // Ba la quan le
                this.Reset();
                var max = 0;
                var min = 0;
                if (Doi[i] > Doi[i + 1]) {
                    this.Value.push(Doi[i]);
                    this.Value.push(Doi[i + 1]);
                } else {
                    this.Value.push(Doi[i + 1]);
                    this.Value.push(Doi[i]);
                }
                for (j = 0; j < 5; j++) {
                    if (this.Cards[j].GetNumber() != Doi[i] && this.Cards[j].GetNumber() != Doi[i + 1])
                        this.Value.push(this.Cards[j].GetNumber());
                }
                return true;
            }
        }
        return false;
    },

    MotDoi: function() {
        // Convert code Binh
        // var [] Doi = new var [];
        var Doi = [];
        var i = 0;
        var j = 0;
        var k = 0;
    
        // Dem so doi co trong 5 la bai
        for (i = 0; i < this.GetNumOfCards() - 1; i++) {
            for (j = i + 1; j < this.GetNumOfCards(); j++) {
                if (this.Cards[i].GetNumber() == this.Cards[j].GetNumber()) {
                    Doi.push(this.Cards[i].GetNumber());
    
                }
            }
        }
    
        if (Doi.length == 1) {
            this.Reset();
            this.Value.push(Doi[0]);
            for (j = this.GetNumOfCards() - 1; j >= 0; j--) {
                if (this.Cards[j].GetNumber() != Doi[0])
                    this.Value.push(this.Cards[j].GetNumber());
            }
            return true;
        }
        return false;
    },

    SanhRong: function() {
        // Convert code Binh
        // Check Sanh Rong gom 13 la bai lien tiep cung chat
        // ----------------------------------------------
        if (this.GetNumOfCards() != 13)
            return false;

        return this.Sanh();

    },

    CungMau: function() {
        // Convert code Binh
        // Check Thung Rong gom 13 la bai cung chat
        // ----------------------------------------------
        if (this.GetNumOfCards() != 13)
            return false;
        var i;
        for (i = 0; i < this.GetNumOfCards(); i++) {
            if (this.Cards[i].GetColor() != this.Cards[0].GetColor())
                return false;
        }
        return true;
    },

    MuoiHai: function() {
        // Convert code Binh
        // Check 12 la bai cung mau` va 1 la khac mau`
        // ----------------------------------------------
        if (this.GetNumOfCards() != 13)
            return false;
        var k = 0;
        for (var i = 0; i < this.GetNumOfCards(); i++) {
            if (this.Cards[i].GetColor() != this.Cards[0].GetColor())
                k++;
        }
        if (k == 1 || k == 12)
            return true;
    
        return false;
    },

    SauDoi: function() {
        /*
         * //Convert code Binh // Check 12 la bai cung mau` va 1 la khac mau`
         * //---------------------------------------------- if(GetNumOfCards()
         * != 13) return false; var i:var = 0; var j:var = 0; var k:var = 0;
         * 
         * // Sap xep lai Group for(i = 0; i < GetNumOfCards() - 1; i++) for(j =
         * i + 1; j < GetNumOfCards(); j++) { if(this.Cards[i].GetNumber() >
         * Cards[j].GetNumber()) { var temp:Card = Cards[i]; Cards[i] =
         * Cards[j]; Cards[j] = temp; } }
         * 
         * var Doi:Array = new Array(); // Dem so doi co trong 5 la bai for (i =
         * 0; i < GetNumOfCards() - 1 ; i++) { if(this.Cards[i].GetNumber() ==
         * Cards[i + 1].GetNumber()) { Doi[k] = Cards[i].GetNumber(); k++; } }
         * 
         * var SoDoi:var = 1; for(i = 0; i < k - 1; i++) { if(Doi[i] != Doi[i +
         * 1]) { SoDoi++; } } if(SoDoi == 6) return true; return false;
         */
    
        // ----------------------------------------------
        if (this.GetNumOfCards() != 13)
            return false;
        var i = 0;
        var j = 0;
        var k = 0;
    
        // Sap xep lai Group
        for (i = 0; i < this.GetNumOfCards() - 1; i++)
            for (j = i + 1; j < this.GetNumOfCards(); j++) {
                if (this.Cards[i].GetNumber() > this.Cards[j].GetNumber()) {
    
                    /*var oldId = Cards[i].ID;
                     Cards[i].ID = Cards[j].ID;
                     Cards[j].ID = oldId;*/
    
                    this.swap(i, j);
                }
            }

        var Doi = new Array(15);
        for (i = 0; i < 15; i++)
            Doi[i] = 0;
        // Dem so doi co trong 5 la bai
        for (i = 0; i < this.GetNumOfCards(); i++) {
            Doi[this.Cards[i].GetNumber()]++;
        }
    
        var SoDoi = 0;
        for (i = 0; i < 15; i++) {
            if (Doi[i] == 4) {
                SoDoi += 2;
            } else if (Doi[i] >= 2) {
                SoDoi++;
            }
        }
        if (SoDoi == 6)
            return true;
        return false;
    },

    NamDoiThong: function() {
        // Convert code Binh
        if (this.GetNumOfCards() != 13)
            return false;
    
    
        var doi = new Array(20);
    
        var i = 0;
        for (i = 0; i < 20; i++) {
            doi[i] = 0;
        }
        var ID = new Array(6);
        for (i = 0; i < 6; i++)
            ID[i] = 0;
        var k = 0;
        var j;
        for (i = 0; i < 13; i++) {
            j = this.Cards[i].GetNumber();
            doi[j]++;
            if (doi[j] == 2) {
                ID[k++] = j;
            }
        }
        if (k >= 5) {
            for (i = 0; i < 5; i++) {
                for (j = i + 1; j < 6; j++) {
                    if (ID[i] < ID[j]) {
                        var temp = ID[i];
                        ID[i] = ID[j];
                        ID[j] = temp;
                    }
                }
            }
            var Index = 5;
            for (i = 0; i < 6; i++) {
                if (ID[i] > 0)
                    Index = i;
            }
            var ii = 0;
            if (k == 6)
                ii = 1;
            if (ID[ii] - ID[Index] == 4)
                return true;
        }
        return false;
    },

    AddCard: function(card) {
        // Convert code Binh
        this.Cards.push(card);
    },

    Reset: function() {
        // Convert code Binh
        this.Value = [];

        // Sap xep lai Group
        for (var i = 0; i < this.GetNumOfCards() - 1; i++)
        for (var j = i + 1; j < this.GetNumOfCards(); j++) {
            if (this.Cards[i].GetNumber() > this.Cards[j].GetNumber()) {

                /*int oldId = Cards[i].ID;
                 Cards[i].ID = Cards[j].ID;
                 Cards[j].ID = oldId;*/

                this.swap(i, j);

            }
        }
    },

    GetMaxNumber: function() {
        // Convert code Binh
        // Sap xep lai Group
        for (var i = 0; i < this.GetNumOfCards() - 1; i++)
        for (var j = i + 1; j < this.GetNumOfCards(); j++) {
            if (this.Cards[i].GetNumber() > this.Cards[j].GetNumber()) {
                /*int oldId = Cards[i].ID;
                 Cards[i].ID = Cards[j].ID;
                 Cards[j].ID = oldId;*/
    
                this.swap(i, j);
            }
        }
    
        if (this.GetGroupKind() == MaubinhGroupCardLogic.EG_SANH || this.GetGroupKind() == MaubinhGroupCardLogic.EG_THUNGPHASANH) {
            if (this.Cards[0].GetNumber() == 2)
                if (this.Cards[this.GetNumOfCards() - 1].GetNumber() == 14) {
                    return this.Cards[this.GetNumOfCards() - 2].GetNumber();
                }
    
        }
    
        return this.Cards[this.GetNumOfCards() - 1].GetNumber();
    },

    GetMaxID: function() {
        // Convert code Binh
        // Sap xep lai Group - tang dan
        for (var i = 0; i < this.GetNumOfCards() - 1; i++)
        for (var j = i + 1; j < this.GetNumOfCards(); j++) {
            if (this.Cards[i].GetNumber() > this.Cards[j].GetNumber()) {
                /*int oldId = Cards[i].ID;
                 Cards[i].ID = Cards[j].ID;
                 Cards[j].ID = oldId;*/

                this.swap(i, j);
            }
        }
    
        if (this.GetGroupKind() == MaubinhGroupCardLogic.EG_SANH) {
            if (this.Cards[0].GetNumber() == 2) {
                if (this.Cards[this.GetNumOfCards() - 1].GetNumber() == 14) {
                    return this.Cards[this.GetNumOfCards() - 2].ID;
                }
            }
    
        }
    
        return this.Cards[this.GetNumOfCards() - 1].ID;
    },

    sortPair: function() {
        // da chac chan co doi
        var i, j;
        var temp;
        // sap xep giam dan
        for (i = 0; i < this.GetNumOfCards() - 1; i++) {
            for (j = i + 1; j < this.GetNumOfCards(); j++) {
                if (this.Cards[i].GetNumber() < this.Cards[j].GetNumber()) {
                    /*int oldId = Cards[i].ID;
                     Cards[i].ID = Cards[j].ID;
                     Cards[j].ID = oldId;*/

                    this.swap(i, j);
    
                } else if (this.Cards[i].GetNumber() == this.Cards[j].GetNumber()) {
                    if (this.Cards[i].ID < this.Cards[j].ID) {
                        /*int oldId = Cards[i].ID;
                         Cards[i].ID = Cards[j].ID;
                         Cards[j].ID = oldId;*/

                        this.swap(i, j);
                    }
                }
            }
        }
    
        var Doi = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
        var k = 0;
        var arr = [];
        for (i = 0; i < this.GetNumOfCards(); i++) {
            Doi[this.Cards[i].GetNumber()]++;
            if (Doi[this.Cards[i].GetNumber()] == 2) {
                arr.push(this.Cards[i].GetNumber());
                k++;
            }
        }
        if (k > 0) {
            // swap vi tri cac doi len vi tri dau tien
            for (var x = 0; x < k; x++) {
                for (i = x * 2; i < this.GetNumOfCards(); i++) {
                    if (this.Cards[i].GetNumber() != arr[x]) {
                        var index = -1;
                        for (j = i + 1; j < this.GetNumOfCards(); j++) {
                            if (arr[x] == this.Cards[j].GetNumber()) {
                                index = j;
                                break;
                            }
                        }
                        if (index != -1) {
    
                            /*int oldId = Cards[i].ID;
                             Cards[i].ID = Cards[index].ID;
                             Cards[index].ID = oldId;*/
                            this.swap(i, index);
    
                        }
                    }
                }
            }
        }
    },

    sortTrio: function() {
        // da chac chan co 1 trio
        var i, j;
        var temp;
        // sap xep giam dan
        for (i = 0; i < this.GetNumOfCards() - 1; i++) {
            for (j = i + 1; j < this.GetNumOfCards(); j++) {
                if (this.Cards[i].GetNumber() < this.Cards[j].GetNumber()) {
    
                    /*int oldId = Cards[i].ID;
                     Cards[i].ID = Cards[j].ID;
                     Cards[j].ID = oldId;*/
                    this.swap(i, j);
    
                } else if (this.Cards[i].GetNumber() == this.Cards[j].GetNumber()) {
                    if (this.Cards[i].GetSuit() < this.Cards[j].GetSuit()) {
                        /*int oldId = Cards[i].ID;
                         Cards[i].ID = Cards[j].ID;
                         Cards[j].ID = oldId;*/

                        this.swap(i, j);
                    }
                }
            }
        }
        // Dem so bo co trong 5 la bai
        var Trio = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
        var k = 0;
        var arr = [];
        for (i = 0; i < this.GetNumOfCards(); i++) {
            Trio[this.Cards[i].GetNumber()]++;
            if (Trio[this.Cards[i].GetNumber()] == 3) {
                arr.push(this.Cards[i].GetNumber());
    
            }
        }
        if (arr.length > 0) {
            // swap vi tri cac doi len vi tri dau tien
            for (var x = 0; x < arr.length; x++) {
                for (i = x * 3; i < this.GetNumOfCards(); i++) {
                    if (this.Cards[i].GetNumber() != arr[x]) {
                        var index = -1;
                        for (j = i + 1; j < this.GetNumOfCards(); j++) {
                            if (arr[x] == this.Cards[j].GetNumber()) {
                                index = j;
                                break;
                            }
                        }
                        if (index != -1) {
                            /*
                             int oldId = Cards[i].ID;
                             Cards[i].ID = Cards[index].ID;
                             Cards[index].ID = oldId;*/

                            this.swap(i, index);
                        }
                    }
                }
            }
        }
    },

    SapXepTruocSoBai2: function() {
        if (this.CuLu() || this.XamChi()) {
            this.sortTrio();
        } else if (this.TuQui() || this.MotDoi() || this.HaiDoiKhacNhau()) {
            this.sortPair();
        } else {
            this.DecreaseSort();
        }
    },

    DecreaseSort: function() {
        var len = this.Cards.length;
        var tmp;
        for (var i = 0; i < len - 1; ++i) {
            for (var j = i + 1; j < len; ++j) {
                if (this.Cards[i].GetNumber() < this.Cards[j].GetNumber()) {
                    /*int oldId = Cards[i].ID;
                     Cards[i].ID = Cards[j].ID;
                     Cards[j].ID = oldId;*/
                    this.swap(i, j);
    
                } else if (this.Cards[i].GetNumber() == this.Cards[j].GetNumber()) {
                    if (this.Cards[i].ID < this.Cards[j].ID) {
                        /*int oldId = Cards[i].ID;
                         Cards[i].ID = Cards[j].ID;
                         Cards[j].ID = oldId;*/

                        this.swap(i, j);
                    }
                }
            }
        }
    },

    AddCardByID: function(id) {
        if (id < 0 || id > MaubinhGroupCardLogic.MAX_CARD)
            return;
        var c = new MaubinhCardLogic(id);
        this.AddCard(c);
    },

    getPair: function() {
        this.DecreaseSort();
        var Result = new MaubinhGroupCardLogic();
        var bDoi = false;
        var Num = new Array(15);
        var i;
        for (i = 0; i < 15; i++)
            Num[i] = 0;
        for (i = 0; i < this.Cards.length; i++) {
            var n = this.Cards[i].GetNumber();
            Num[n]++;
        }
        for (i = 15 - 1; i >= 0; i--) {
            if (Num[i] == 2) {
                var nCard = 0;
                for (var j = 0; j < this.Cards.length; j++) {
                    if (this.Cards[j].GetNumber() == i && nCard < 2) {
                        Result.AddCardByID(this.Cards[j].ID);
                        nCard++;
                    }
                }
                break;
            }
        }
        return Result;
    },

    getXamChi: function() {
        this.DecreaseSort();
        var Result = new MaubinhGroupCardLogic();
        var Num = new Array(15);
        var i;
        for (i = 0; i < 15; i++)
            Num[i] = 0;
        for (i = 0; i < this.Cards.length; i++) {
            var n = this.Cards[i].GetNumber();
            Num[n]++;
        }
        for (i = 15 - 1; i >= 0; i--) {
            if (Num[i] == 3) {
                for (var j = 0; j < this.Cards.length; j++) {
                    if (this.Cards[j].GetNumber() == i)
                        Result.AddCardByID(this.Cards[j].ID);
                }
                break;
            }
        }
        return Result;
    },

    get2DoiKhacNhau: function() {
        // da chac chan co 2 doi khac nhau
        var Result = new MaubinhGroupCardLogic();
        if (this.Cards.length < 4)
            return Result;
        this.DecreaseSort();
        var b2Doi = false;
        var Num = new Array(15);
        var i;
        for (i = 0; i < 15; i++)
            Num[i] = 0;
        for (i = 0; i < this.Cards.length; i++) {
            var n = this.Cards[i].GetNumber();
            Num[n]++;
        }
        var k = 0;
        for (i = 15 - 1; i >= 0; i--) {
            if (Num[i] == 2) {
                ++k;
                for (var z = 0; z < this.Cards.length; z++)
                if (this.Cards[z].GetNumber() == i)
                    Result.AddCardByID(this.Cards[z].ID);
                if (k == 2)
                    break;
            }
        }
        return Result;
    },

    getFour: function() {
        var Result = new MaubinhGroupCardLogic();
        if (this.Cards.length < 4)
            return Result;
        this.DecreaseSort();
        var bFour = false;
        var Num = new Array(15);
        var i;
        for (i = 0; i < 15; i++)
            Num[i] = 0;
        for (i = 0; i < this.Cards.length; i++) {
            var n = this.Cards[i].GetNumber();
            Num[n]++;
        }
        var k = 0;
        for (i = 15 - 1; i >= 0; i--) {
            if (Num[i] == 4) {
                ++k;
                for (var z = 0; z < this.Cards.length; z++)
                if (this.Cards[z].GetNumber() == i)
                    Result.AddCardByID(this.Cards[z].ID);
                break;
            }
        }
        return Result;
    },

    getMaxCard: function() {
        var Result = new MaubinhGroupCardLogic();
        if (this.Cards.length < 1)
            return Result;
        Result.AddCardByID(this.GetMaxID());
        return Result;
    },

    swap: function(card1, card2){
        var temp = this.Cards[card1];
        this.Cards[card1] = this.Cards[card2];
        this.Cards[card2] = temp;
    }

});

MaubinhGroupCardLogic.EG_THUNGPHASANHTHUONG = 0
MaubinhGroupCardLogic.EG_THUNGPHASANH = 1
MaubinhGroupCardLogic.EG_TUQUI = 2
MaubinhGroupCardLogic.EG_CULU = 3
MaubinhGroupCardLogic.EG_THUNG = 4
MaubinhGroupCardLogic.EG_SANH = 5
MaubinhGroupCardLogic.EG_SAMCO = 6
MaubinhGroupCardLogic.EG_THU = 7
MaubinhGroupCardLogic.EG_DOI = 8
MaubinhGroupCardLogic.EG_MAUTHAU = 9
MaubinhGroupCardLogic.MAX_CARD = 52