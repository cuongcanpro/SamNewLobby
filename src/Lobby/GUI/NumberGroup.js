/**
 * Created by HunterPC on 9/1/2015.
 */

var NumberGroup = cc.Node.extend({
    ctor : function () {
        this._super();
        this._width = 0;
        this._height = 0;
    },

    setNumber : function (number) {
        if(number < 0) return;

        var nStr = StringUtility.pointNumber(number);

        var dc = new cc.Sprite("bosodem/plus.png");
        dc.setPosition(0,0);
        this.addChild(dc);

        var curX = dc.getPositionX() + dc.getContentSize().width/2;
        var curY = dc.getPositionY();

        var commaY = (new cc.Sprite("bosodem/1.png")).getContentSize().height;

        for(var i = 0 ; i < nStr.length ; i++)
        {
            var nContent = "bosodem/";
            var isComma = false;
            if(nStr.charAt(i) == '.')
            {
                nContent += "dot.png";
                isComma = true;
            }
            else
            {
                nContent += nStr.charAt(i) + ".png";
            }

            var ns = new cc.Sprite(nContent);
            this.addChild(ns);
            ns.setPositionX(curX + ns.getContentSize().width/2);
            if(isComma)
            {
                var y = ns.getContentSize().height;
                ns.setPositionY(- commaY/2 + y/2);
            }
            else
            {
                ns.setPositionY(curY);
            }

            curX += ns.getContentSize().width*1.1;

            this._height = ns.getContentSize().height;
        }

        this._width = curX;

        this.updatePosition();
    },

    updatePosition : function () {
        this.setPositionX(this.getPositionX() - this._width/2 * this.getScale());
    }
});