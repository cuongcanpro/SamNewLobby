/**
 * Created by HOANGNGUYEN on 7/20/2015.
 */

var BaseScene = cc.Scene.extend({

    ctor: function(){
        this._super();

        this.scheduleUpdate();
    },

    onEnter : function () {
        cc.Scene.prototype.onEnter.call(this);

        sceneMgr.initialLayer();
    },

    addChild: function(child,tag,oder){
        if(tag === undefined) tag = BaseScene.TAG_LAYER;
        if(oder === undefined) oder = BaseScene.TAG_LAYER;

        cc.Scene.prototype.addChild.call(this,child);
        child.setTag(tag);
        child.setLocalZOrder(oder);
        this.setContentSize(cc.winSize);
        this.setAnchorPoint(cc.p(0.5,0.5));

        var decoLayer = EffectTouchLayer.getInstance();
        decoLayer.retain();
        decoLayer.removeFromParent(false);
        decoLayer.setTag(EffectTouchLayer.TAG);
        decoLayer.setLocalZOrder(EffectTouchLayer.TAG);
        cc.Scene.prototype.addChild.call(this,decoLayer);
    },

    getMainLayer: function(){
        return this.getChildByTag(BaseScene.TAG_LAYER);
    },
    
    getLayerGUI : function () {
        return this.getChildByTag(BaseScene.TAG_GUI);
    },

    update : function (dt) {
        sceneMgr.updateScene(dt);
    }
});

BaseScene.TAG_LAYER = 101;
BaseScene.TAG_GUI = 102;

BaseScene.createWithLayer = function(layer){
    var scene = new BaseScene();
    scene.addChild(layer);
    return scene;
};

makeScene = function(layer){
    var scene = new BaseScene();
    scene.addChild(layer);
    return scene;
};