/**
 * Created by HOANGNGUYEN on 7/23/2015.
 */

var Toast = cc.Layer.extend({

    ctor: function(time,message){
        this._super();
        this._time = time;
        this._message = message;
        this._layerColor = new cc.LayerColor(cc.BLACK);
        this._layerColor.setOpacity(210);
        this.addChild(this._layerColor);
    },

    onEnter: function() {
        var scale = cc.director.getWinSize().width/Constant.WIDTH;
        scale = (scale > 1) ? 1 : scale;

        cc.Layer.prototype.onEnter.call(this);

        this._label = new ccui.Text();
        this._label.setAnchorPoint(cc.p(0.5,0.5));
        this._label.ignoreContentAdaptWithSize(true);
        //this._label._customSize = true;
        //this._label._setWidth(cc.winSize.width * 0.5);

        //this._label._setBoundingWidth(cc.winSize.width * 0.5);
        //this._label.setLineBreakOnSpace(true);
        //this._label.setTextAreaSize(cc.size(cc.winSize.width * 0.5, 40));

        this._label.setFontName(SceneMgr.FONT_NORMAL);
        if (!cc.sys.isNative){
            this._label.setFontName("tahoma");
        }
        this._label.setFontSize(24);
        this._label.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this._label.setTextVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
        this._label.setColor(sceneMgr.ccWhite);
        this._label.setString(this._message);
        this._label.setScale(scale);

        this._layerColor.addChild(this._label);
        this._layerColor.setPosition(0,0);

        cc.log("POSITION", this._layerColor.width * 0.5, this._label.getContentSize().height * 0.5);
        this._label.setPosition(
            this._layerColor.width * 0.5,
            (this._label.getContentSize().height + Toast.MARGIN) * 0.5
        );
        this.setPosition(0, cc.winSize.height);

        this.runAction(cc.sequence(
            new cc.EaseBackOut(cc.moveBy(0.3, cc.p(0, - this._label.getContentSize().height - Toast.MARGIN))),
            cc.delayTime(this._time),
            new cc.EaseBackIn(cc.moveBy(0.3, cc.p(0, this._label.getContentSize().height + Toast.MARGIN))),
            cc.removeSelf()
        ));
    }
});

Toast.makeToast = function(time,message){
    var instance = new Toast(time,message);
    sceneMgr.layerGUI.addChild(instance);
    instance.setLocalZOrder(LOADING_TAG);
    return instance;
};
Toast.MARGIN = 30;

Toast.SHORT = 1.0;
Toast.LONG = 2.0;