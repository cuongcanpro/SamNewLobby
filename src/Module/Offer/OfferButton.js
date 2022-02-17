/**
 * Created by sonbnt on 24/12/2021
 * @author sonbnt
 * @file OfferButton
 */

var OfferButton = cc.Node.extend({
    ctor: function () {
        this._super();
        this.btn = new ccui.Button("Offer/iconOfferNormal.png");
        this.addChild(this.btn);
        this.btn.setPosition(0, 0);
        this.btn.addClickEventListener(this.touchEvent.bind(this));
        this.btn.ignoreContentAdaptWithSize(true);

        this.lbTime = new ccui.Text("", SceneMgr.FONT_BOLD, 21);
        this.addChild(this.lbTime);
        this.lbTime.ignoreContentAdaptWithSize(true);
        this.lbTime.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this.lbTime.setTextVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
        this.lbTime.setString("lfjsdfsd");
        this.lbTime.setAnchorPoint(0.5, 0.5);
        this.lbTime.setPosition(0, -this.btn.getContentSize().height * 0.65);
        this.lbTime.setColor(cc.color(239, 217, 108));
        this.lbTime.enableOutline(cc.color(131, 73, 52), 1);

        this.tagZalo = new ccui.ImageView("Offer/tagZalo.png");
        this.tagZalo.setPosition(32, 15);
        this.addChild(this.tagZalo);
        this.tagZalo.setVisible(false);
    },

    touchEvent: function () {
        if (offerManager.haveOneOfferById(this.offerData.offerId)) {
            offerManager.showOfferGUI(true, this.offerData);
        } else {
            ToastFloat.makeToast(ToastFloat.SHORT, LocalizedString.to("NO_OFFER"));
        }

    },

    setInfo: function (offer) {
        this.offerData = offer;
        this.setVisible(true);
        this.tagZalo.setVisible(false);
        this.btn.setPositionX(0);
        if (offer.typeGroupOffer == OfferManager.TYPE_GROUP_NORMAL) {
            this.btn.loadTextures("Offer/iconOfferNormal.png", "Offer/iconOfferNormal.png", "Offer/iconOfferNormal.png");
        }
        else if (offer.typeGroupOffer == OfferManager.TYPE_GROUP_ZALO) {
            this.tagZalo.setVisible(true);
            if (offer.isFirstPay) {
                this.btn.loadTextures("Offer/iconZaloFirstPay.png", "Offer/iconZaloFirstPay.png", "Offer/iconZaloFirstPay.png");
                this.btn.setPositionX(-3);
            }
            else {
                this.btn.loadTextures("Offer/iconZaloRepay.png", "Offer/iconZaloRepay.png", "Offer/iconZaloRepay.png");
            }
        }
        else {
            if (offer.isFirstPay) {
                this.btn.loadTextures("Offer/iconFirstPay.png", "Offer/iconFirstPay.png", "Offer/iconFirstPay.png");
            }
            else {
                this.btn.loadTextures("Offer/iconRepay.png", "Offer/iconRepay.png", "Offer/iconRepay.png");
            }
        }
    },

    updateOffer: function () {
        if (this.isVisible()) {
            this.lbTime.setString(StringUtility.getTimeString(this.offerData.getTimeLeftInSecond()));
        }
    }
});