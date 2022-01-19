/**
 * Created by HunterPC on 2/19/2016.
 */

var MoneyGroup = cc.Node.extend({

    ctor: function () {
        this._super();
    },


    setMoney: function (money) {

        this.removeAllChildren();

        var width = 0;
        var height = 0;

        var sSignal = "bosothang/cong.png";
        var sContent = "bosothang/so";
        var sComma = "bosothang/dot.png";

        if (money < 0) {
            sSignal = "bosothua/tru.png";
            sContent = "bosothua/so";
            sComma = "bosothua/dot.png";
        }

        var signal = cc.Sprite(sSignal);
        this.addChild(signal);

        var pad = signal.getContentSize().width * 0.1;
        width = width + signal.getContentSize().width;

        money = Math.abs(money);
        var arrayChar = StringUtility.pointNumber(money);

        for (var i = 0; i < arrayChar.length; i++) {
            if (arrayChar[i] != '.') {
                var content = sContent + arrayChar[i] + ".png";
                var image = new cc.Sprite(content);
                this.addChild(image);
                image.setPosition(width + pad + image.getContentSize().width / 2, image.getContentSize().height / 2);
                width = width + image.getContentSize().width + pad;
                height = image.getContentSize().height;
            }
            else {
                var image = new cc.Sprite(sComma);
                this.addChild(image);
                image.setPosition(width + pad + image.getContentSize().width / 2, image.getContentSize().height * 0.6);
                width = width + image.getContentSize().width + pad;
            }
        }
        signal.setPosition(signal.getContentSize().width / 2, height / 2);

        this.setContentSize(cc.size(width, height));
    }
});