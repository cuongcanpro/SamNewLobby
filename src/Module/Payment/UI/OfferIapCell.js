
var OfferIapCell = cc.TableViewCell.extend({
    ctor: function (p) {
        this._super();

        this.tParent = p;
        var jsonLayout = ccs.load("OfferIapItem.json");
        this._layout = jsonLayout.node;
        ccui.Helper.doLayout(this._layout);
        this.addChild(this._layout);

        this.bg = ccui.Helper.seekWidgetByName(this._layout, "bg");
        this.btn = ccui.Helper.seekWidgetByName(this._layout, "btn");
        this.cost = ccui.Helper.seekWidgetByName(this.btn, "vnd");
        this.currency = ccui.Helper.seekWidgetByName(this.btn, "lb");
        this.lbOldPrice = ccui.Helper.seekWidgetByName(this.btn, "lbOldPrice");
        this.imgLine = ccui.Helper.seekWidgetByName(this.btn, "imgLine");
        this.lbTime = ccui.Helper.seekWidgetByName(this.btn, "lbTime");

        this.goldOld = ccui.Helper.seekWidgetByName(this._layout, "gold_old");
        this.iconLine = ccui.Helper.seekWidgetByName(this._layout, "iconLine");
        this.goldNew = new NumberGroupCustom("res/Lobby/ShopIAP/Number/num_", -4, NumberGroupCustom.TYPE_POINT);
        this.goldNew.setPositionX(this._layout.getContentSize().width * 0.5);
        this.goldNew.setPositionY(this.goldOld.getPositionY() - 40);
        this.goldNew.defaultPos = this.goldNew.getPosition();
        this.bg.addChild(this.goldNew);
        this.bgBonus = ccui.Helper.seekWidgetByName(this._layout, "bgBonus");
        this.bgBonus.setLocalZOrder(2);

        this.pPromo = ccui.Helper.seekWidgetByName(this._layout, "pPromo");
        this.lbPromo = ccui.Helper.seekWidgetByName(this.pPromo, "lbPromo");
        this.lbPromo.setPositionX(ItemIapCell.WIDTH_ITEM);

        this.arrayDot = [];
        for (var i = 0; i < 12; i++) {
            this.arrayDot[i] = new cc.Sprite("Lobby/Common/dotNormal.png");
            this._layout.addChild(this.arrayDot[i]);
            this.arrayDot[i].setPosition(24 * (i + 1), ItemIapCell.HEIGHT_ITEM - 16);
        }
        this.stateEffect = 0;
        this.timeEfffect = 0;

        this.lastActionUpdate = 0;

        this.groupBonus = new GroupShopBonus(true);
        this.bg.addChild(this.groupBonus);
        this.groupBonus.setPosition(ItemIapCell.WIDTH_ITEM * 0.5 - this.groupBonus.getContentSize().width * 0.5, 500)

        this.lastActionUpdate = 0;
    },

    setInfo: function (inf) {
        this.info = inf;
        this.lastActionUpdate = 0;

        if (!isNaN(inf.cost))
            this.cost.setString(StringUtility.pointNumber(inf.cost));
        else
            this.cost.setString(inf.cost);
        this.currency.setPositionX(this.cost.getAutoRenderSize().width * 0.5 + this.cost.getPositionX() + 10);
        if (!isNaN(inf.costConfig)) {
            if (inf.costConfig == inf.cost) {
                this.lbOldPrice.setVisible(false);
                this.imgLine.setVisible(false);
            } else {
                this.lbOldPrice.setString(StringUtility.pointNumber(inf.costConfig) + " vnđ");
                this.imgLine.setScaleX(this.lbOldPrice.getContentSize().width / this.imgLine.getContentSize().width);
            }
        } else {
            this.lbOldPrice.setVisible(false);
        }

        this.goldOld.setString(StringUtility.pointNumber(inf.goldOld));
        this.goldNew.setNumber(inf.goldNew);
        this.goldOld.setVisible(inf.goldNew != inf.goldOld);
        this.iconLine.setContentSize(cc.size(this.goldOld.getAutoRenderSize().width, this.iconLine.getContentSize().height));
        this.iconLine.setVisible(inf.goldNew != inf.goldOld);

        if (inf.bonus.length <= 0) {
            this.lbPromo.setVisible(false);
        } else {
            this.lbPromo.setVisible(true);
            this.lbPromo.setString(inf.bonus);
        }

        //set info bonus ticket
        this.groupBonus.setInfoOffer(inf);
        this.groupBonus.setPositionY(this.goldNew.getPositionY() - 40 - this.groupBonus.getContentSize().height);

        this.updateTime();
        this.unscheduleUpdate();
        this.scheduleUpdate();
    },

    updateTime: function () {
        var offer = offerManager.getOfferById(this.info.offerId);
        if (offer) {
            var time = offer.getTimeLeftInSecond();
            var s = LocalizedString.to("OFFER_REMAIN_TIME_2");
            if (time >= 1) {
                var str = StringUtility.getTimeString2(time);
                s = StringUtility.replaceAll(s, "@time", str);
            } else {
                s = LocalizedString.to("OFFER_REMAIN_TIME_3");
            }
        }
        else {
            s = LocalizedString.to("OFFER_REMAIN_TIME_3");
        }
        this.lbTime.setString(s);
    },

    update: function (dt) {
        this.updateTime();
        if (this.lbPromo.isVisible()) {
            this.lbPromo.setPositionX(this.lbPromo.getPositionX() - 0.8);
            if (this.lbPromo.getPositionX() < -200) {
                this.lbPromo.setPositionX(ItemIapCell.WIDTH_ITEM);
            }
        }
        this.timeEfffect = this.timeEfffect - dt;
        if (this.timeEfffect < 0) {
            this.timeEfffect = 0.2;
            this.stateEffect = 1 - this.stateEffect;
            for (var i = 0; i < this.arrayDot.length; i++) {
                this.arrayDot[i].setTexture(i % 2 == this.stateEffect ? "Lobby/Common/dotNormal.png" : "Lobby/Common/dotLight.png");
            }
        }
    }
});
